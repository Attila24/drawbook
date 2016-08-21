'use strict';

import express from 'express';
import userRouter from './routes.users';
import imageRouter from './routes.users.images';
import commentRouter from './routes.users.images.comments';
import likeRouter from './routes.users.images.likes';
import notificationRouter from './routes.users.notifications';
import fololowersRouter from './routes.users.followers';

const router = express.Router();

router.use('/users/', userRouter);
router.use('/users/:username/images/', imageRouter);
router.use('/users/:username/images/:imageid/comments/', commentRouter);
router.use('/users/:username/images/:imageid/likes/', likeRouter);
router.use('/users/:username/notifications/', notificationRouter);
router.use('/users/:username/followers/', fololowersRouter);

export default router;