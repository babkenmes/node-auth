var mongoose = require('mongoose');
var log = require('./log')(module);
var config = require('./config');
var User = require('./../models/User');
var Client = require('./../models/Client');
mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;
User.findOne({ username: "admin" }, function (err, adminUser) {
    if (err) {
        log.error('error connecting to users collection: ', err.message);
    }
    if (!adminUser) {
        adminUser = new User({
            username: "admin",
            firstName: "John",
            lastName:"Angry",
            password: "pass@world1",
            role: "admin"
        });
        adminUser.save(function (err, user) {
            if (err) return log.error(err);
            else log.info("New user - %s:%s", user.username, user.password);
        });
    }
});
Client.findOne({ clientId: config.get("ClientId") }, function (err, angularClient) {
    if (err) {
        log.error('error connecting to clients collection: ', err.message);
    }
    if (!angularClient) {
        var angularClient = new Client({
            name: "node-auth Web client app", clientId: config.get("ClientId"), clientSecret: config.get("ClientSecret") });
        angularClient.save(function (err, client) {
            if (err) return log.error(err);
            else log.info("New client - %s:%s", client.clientId, client.clientSecret);
        });
    }
});
db.on('error', function (err) {
    log.error('connection error: ', err.message);
});
db.once('open', function callback() {
    log.info("Connected to DB!");
});
module.exports = db;