const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const log = require('../libs/log')(module);
const CallEvent = require('../models/callevent.js');
const Presentation = require('../models/presentation.js');
const CallRecording = require('../models/CallRecording.js');

router.post('/bit6Event', function (req, res, next) {
    if (!req.body.type) {
        log.error("Cannot get web hook event type.");
        res.status(400).send({ error: 'Cannot get web hook event type.' }).end();
        return;
    }

    if (req.body.type === "cdr") {
        var entity = new CallEvent();
        entity.from = req.body.from;
        entity.to = req.body.to;
        entity.duration = req.body.duration;
        entity.start = Date(req.body.start);

        CallEvent.create(entity, function (err, post) {
            if (err) return next(err);
            res.json(post).end();
            return
        });
    }  else {
        if (req.body.type === "recording") {
            var fromParts = req.body.from.split(':');
            if (fromParts.length < 2) {
                var error = "Invalid from field in hook data.";
                log.error(error);
                throw error;
            }

            var presentationId = fromParts[1];
            Presentation.findById(presentationId).select('+recordings').exec(function (err, pres) {
                if (err) return next(err);
                if (pres) {
                    var recording = new CallRecording.CallRecordings();
                    recording.from = req.body.from;
                    recording.to = req.body.to;
                    recording.duration = req.body.duration;
                    recording.start = Date(req.body.start);
                    recording.url = req.body.url;

                    pres.recordings.push(recording);
                    pres.save(function (error) {
                        if (!error) {
                            res.json(pres).end();
                        }
                        else {
                            log.error(error);
                            res.status(500).send({ 'error': error }).end();
                        }
                    });
                } else {
                    res.status(404).send({ error: 'Presentation not found.' }).end();
                    return;
                }
            });

        }
    }
});

module.exports = router;