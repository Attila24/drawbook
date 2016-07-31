var express         = require('express'),
    router          = express.Router(),
    userRouter      = require('./routes.users'),
    imageRouter     = require('./routes.users.images.js'),
    commentRouter   = require('./routes.users.images.comments'),
    passport        = require('passport');

router.use('/users/', userRouter);
router.use('/users/:username/images/', imageRouter);
router.use('/users/:username/images/:imageid/comments/', commentRouter);

module.exports = router;