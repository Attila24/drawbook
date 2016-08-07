'use strict';

import express from 'express';
import userRouter from './routes.users';
import imageRouter from './routes.users.images';
import commentRouter from './routes.users.images.comments';

const router = express.Router();

router.use('/users/', userRouter);
router.use('/users/:username/images/', imageRouter);
router.use('/users/:username/images/:imageid/comments/', commentRouter);

export default router;