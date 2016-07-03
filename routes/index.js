var express     = require('express'),
    router      = express.Router(),
    userRouter  = require('./routes.users'),
    passport    = require('passport'),
    User        = require('../db/models/user');

router.use('/users/', userRouter);



module.exports = router;