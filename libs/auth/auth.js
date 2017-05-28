var passport = require('passport');
var passportJWT = require("passport-jwt");
var LocalStrategy = require('passport-local').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ExtractJwt = passportJWT.ExtractJwt;
var JWTStrategy = passportJWT.Strategy;

var libs = process.cwd() + '/libs/';

var config = require('./../config');

var params = {
    secretOrKey: config.get("jwtSecret"),
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

var User = require('./../../models/User');
var Client = require('./../../models/Client');
var AccessToken = require('./../../models/AccessToken');
var RefreshToken = require('./../../models/RefreshToken');

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username.toLowerCase() }).select('+hashedPassword +salt').exec(function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.checkPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret !== clientSecret) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function (accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function (err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done(null, false);
            }
            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                        return done(err);
                    }
                });
                return done(null, false, { message: 'Token expired' });
            }
            User.findById(token.userId, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Unknown user' });
                }
                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));
passport.use(new JWTStrategy(params, function (jwt_payload, done) {
    User.findOne({ username: jwt_payload.username }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

