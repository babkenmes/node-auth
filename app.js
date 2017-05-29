#!/usr/bin/env node

var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var log = require('./libs/log')(module);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
var oauth2 = require('./libs/auth/oauth2');
var device = require('express-device');

app.set('port', process.env.PORT || 3000);



var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

app.server = server;


var mongooseDb = require('./libs/dbconn.js');

var authCtrl = require('./controllers/userauth');
var userCtrl = require('./controllers/user');
var indexCtrl = require('./controllers/index');

var jwt = require('jsonwebtoken');
var config = require('./libs/config');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(device.capture());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(bodyParser.text({ limit: '50mb' }));
// Setup app directories.
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use('/uploads/ads', express.static(path.join(__dirname, 'public/uploads/ads')));
app.use('/reports', express.static(path.join(__dirname, 'public/reports')));

app.use('/ACMESharp.AuthorizeChallenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));
app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));


// Setup controllers
app.use('/', indexCtrl);
app.use('/api/v1/Users', userCtrl);
app.use('/api/v1/auth', authCtrl);


module.exports = app;