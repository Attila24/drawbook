'use strict';

import express from 'express';
import userRouter from './routes.users';
import imageRouter from './routes.users.images';
import commentRouter from './routes.users.images.comments';
import likeRouter from './routes.users.images.likes';

const router = express.Router();

router.use('/users/', userRouter);
router.use('/users/:username/images/', imageRouter);
router.use('/users/:username/images/:imageid/comments/', commentRouter);
router.use('/users/:username/images/:imageid/likes/', likeRouter);

export default router;