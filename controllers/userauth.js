/// Auth Controller

const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
const helper = require('./../libs/entityHelper');
const oauth2 = require('./../libs/auth/oauth2');
const jwt = require('jsonwebtoken');
const config = require('../libs/config');
const constants = require('./../libs/constants');

require('../libs/auth/auth');
router.use(passport.initialize());
router.post('/token', oauth2.token);

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.json(401, { error: 'You have no permission to execute this action.' });
        }
        //user has authenticated correctly thus we create a JWT token 
        var token = jwt.sign({ username: user.username, role: user.role, _id: user._id,}, config.get("jwtSecret"));
        res.json({ success: true, token: token, username: user.username, fullName: user.firstName + " " + user.lastName, role: user.role });
    })(req, res, next);
});

router.get('/api/userInfo',
    oauth2.token,
    function (req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json({ user_id: req.user.userId, name: req.user.username, role: req.user.role, scope: req.authInfo.scope })
    }
);

module.exports = router;