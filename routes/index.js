var express     = require('express'),
    router      = express.Router(),
    userRouter  = require('./routes.users'),
    imageRouter = require('./routes.users.images.js'),
    passport    = require('passport');

router.use('/users/', userRouter);
router.use('/users/:username/images/', imageRouter);

module.exports = router;