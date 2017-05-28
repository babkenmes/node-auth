const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User.js');
const helper = require('../libs/entityHelper');
const oauth2 = require('./../libs/auth/oauth2');
const constants = require('./../libs/constants');

router.use(function (req, res, next) {
    if (req.url.indexOf("register") != -1) {
        next();
    }
    else {
        var token = req.headers.authorization.split(" ")[1];
        passport.authenticate('jwt', function (err, user, info) {
            if (req.user.role == constants.roles.adminRoleName) {
                req.user.queryConditions = {
                    "$or": [
                        { "role": constants.roles.medRepRoleName },
                    ]
                };
                next();
            }
            else {
                return res.status(403).send("You are not aouthorized");
            }
        })(req, res, next);
    }
});

/* GET all Users. */
router.get('/', function (req, res) {
    User.find(req.user.queryConditions, function (err, todos) {
        if (err) return next(err);
        res.json(todos);
    });
});

/* GET /Users/id */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        if (!post) {
            res.send(404);
        }
        else {
            res.json(post);
        }
    });
});

/* POST: Add new Users*/
router.post('/register', function (req, res, next) {
    var entity = new User();
    entity = req.body;
    User.create(entity, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST: Add new Users*/
router.post('/', function (req, res, next) {
    var entity = new User();
    entity = req.body;
    helper.setCommonProps(entity, true, req.user.username);
    User.create(entity, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /Users/:id */
router.put('/:id', function (req, res, next) {
    var entity = req.body;
    helper.setCommonProps(entity, false, req.user.username);
    User.findByIdAndUpdate(req.params.id, entity, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /Users/:id */
router.delete('/:id', function (req, res, next) {
    var entity = new User();
    entity.firstName = req.body.firstName;
    entity.lastName = req.body.lastName;
    entity.middleName = req.body.middleName;
    helper.setCommonProps(entity, true, req.user.username);
    req.user.queryConditions["_id"] = req.params.id;
    User.findOneAndRemove(req.user.queryConditions, entity, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});



module.exports = router;