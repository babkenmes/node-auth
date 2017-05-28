const constants = require('./../libs/constants');
const Presentation = require('../models/presentation');
const jwt = require('jsonwebtoken');
const config = require('./../libs/config');

const createNamespace = function (io, presentation) {
    var ionsp = io.of('/' + presentation._id);
    ionsp.presentation = presentation;
    ionsp.clients = [];
    ionsp.use(function (socket, next) {
        if (!(socket.request._query && socket.request._query.token)) {
            next(new Error("No JWT token"));
            return;
        }
        var token = socket.request._query.token;
        jwt.verify(token, config.get("jwtSecret"), function (err, decoded) {
            if (err) { console.log(err); socket.disconnect(true); }
            Presentation.findById(presentation._id, function (err, presnew) {
                if (err) {
                    console.log(err);
                    socket.disconnect(true);
                }
                if (decoded.role == "doctor" && (ionsp.doctorIsOnline)) {
                    console.log("doctor trying to watch presentation ", decoded._id, decoded.username, presnew._id)
                    socket.disconnect(true);
                }
                socket.role = decoded.role;
                socket.userId = decoded._id;
                socket.username = decoded.username;
                setCallbacks(socket, ionsp, io, presnew);
                next();
            });
        });
        ionsp.on('connection', function (socket) {
            if (ionsp.currentSlideId) {
                ionsp.emit('slide', ionsp.currentSlideId);
            }
            if (socket.role == "doctor") {
                ionsp.doctorIsOnline = true;
                ionsp.emit('doctorConnected', socket.client.id);
                ionsp.slidesInfo.push({ slideIndex: ionsp.currentSlideId, action: "watch", time: new Date() });
            }
            if (socket.role == constants.roles.supervisorRoleName) {
                ionsp.emit('supervisorConnected', socket.client.id);
                socket.emit('presentationCallOnline', ionsp.callIsOnline);
            }
            if (socket.role == constants.roles.medRepRoleName || socket.role == constants.roles.adminRoleName) {
                console.log("Presenter connected ");
                ionsp.presentation.status = "online";
                ionsp.presentation.accuredDate = ionsp.presentation.accuredDate || new Date();
                ionsp.presentation.save(function (err,data) {
                    if (err) {
                        console.log('error updating status', err, data);
                        socket.disconnect(true);
                    }
                    else {
                        console.log('success, status updated' + new Date());
                    }
                });
            }
        });
    });
};

function setCallbacks(socket, ionsp, io) {
    ionsp.slidesInfo = ionsp.slidesInfo ? ionsp.slidesInfo : [];
    ionsp.currentSlideId = ionsp.currentSlideId ? ionsp.currentSlideId : 0;
    if (socket.role == constants.roles.medRepRoleName || socket.role == constants.roles.adminRoleName) {
        setMedPredCallbacks();
    }
    if (socket.role == constants.roles.supervisorRoleName) {
        setsupervisorCallbacks();
    }
    if (socket.role == "doctor") {
        setdoctorCallbacks();
    }
    function setMedPredCallbacks() {
        socket.on('presentationCallOnline', function (isOnline) {
            ionsp.callIsOnline = isOnline;
            ionsp.emit('presentationCallOnline', isOnline);
        });
        socket.on('slide', function (slideId) {
            if (ionsp.doctorIsOnline) {
                ionsp.slidesInfo.push({ slideIndex: slideId, action:"watch", time: new Date() });
            }
            ionsp.currentSlideId = slideId;
            ionsp.emit('slide', slideId);
        });
        socket.on('laserBeamMove', function (coords) {
            ionsp.emit('laserBeamMove', coords);
        });
        socket.on('finishPresentation', function (msg) {
            ionsp.presentation.status = "finished";
            var presentationIsFinised = true;
            saveSlideInfo(ionsp, "finished");
            ionsp.emit('finishPresentation', msg);
            disconnectNamsepace(io, ionsp);
        });       
        socket.on('disconnect', function () {
            var status = ionsp.presentation.status == "online" ? "offline" : ionsp.presentation.status;
            saveSlideInfo(ionsp, status);
            console.log('user disconnected');
            disconnectNamsepace(io, ionsp);
        });
    }
    function setsupervisorCallbacks() {
        socket.on('suplisten', function () {
            ionsp.emit('callToSup', { id: socket.userId });
        });
        socket.on('disconnect', function () {
            console.log("supervisor disconnected");
            ionsp.emit('supervisorDisconnected');
        });
        //// callbacks for supervisor
    }
    function setdoctorCallbacks() {
        socket.on('disconnect', function () {
            ionsp.slidesInfo.push({ slideIndex: ionsp.currentSlideId, action: "disconnect", time: new Date() });
            ionsp.doctorIsOnline = false;
            ionsp.emit('doctorDisconnected');
        });
        socket.on('surveySubmitted', function () {
            Presentation.findById(ionsp.presentation._id).select('+slidesInfo +recordings').populate('medRep').populate('doctor').populate('file').populate('survey.survey').populate('survey.answers.question').populate('selectedAdvmaterials').exec(function (err, presnew) {
                if (err) {
                    console.log(err);
                    socket.disconnect(true);
                }
                ionsp.emit('presentation', presnew);
            });
        });
    }
    function disconnectNamsepace(io, ionsp) {
        if (io.nsps[ionsp.name]) {
            var nsp = io.of(ionsp.name); 
            nsp.emit('medRepDisconnected');
            nsp.emit('disconnect');
            delete io.nsps[ionsp.name];
            if (Object.keys(io.nsps).length === 0) {
                io.disconnect();
            }
        }
    }
    function saveSlideInfo(ionsp, status) {
        Presentation.findById(ionsp.presentation._id).select('+slidesInfo').exec(function (err, presnew) {
            if (err) {
                console.log(err);
                socket.disconnect(true);
            }
            ionsp.slidesInfo.push({ slideIndex: ionsp.currentSlideId, action: "disconnect", time: new Date() });
            presnew.slidesInfo = ionsp.presentation.slidesInfo ? ionsp.presentation.slidesInfo.concat(ionsp.slidesInfo) : ionsp.slidesInfo;
            if (status) {
                presnew.status = status;
            }
            presnew.save(function (err, data) {
                if (err) {
                    console.log(err);
                    socket && socket.disconnect(true);
                }
            });
        });
    }
}


module.exports.setCallbacks = setCallbacks;
module.exports.createNamespace = createNamespace;