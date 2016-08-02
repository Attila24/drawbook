'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import multipart from 'connect-multiparty';
import db from './db/db';

const app     = express();
const port    = process.env.PORT || 5000;

// Configuration ======================

mongoose.Promise = global.Promise;
mongoose.connect(db.url);

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(multipart({
    uploadDir: 'app/uploads/avatars'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('', express.static(`${__dirname}/../app`));

// Routers ======================

import router from './routes';
app.use('/api/', router);

// angular - html5mode reload fix
app.use((req, res) => {
    res.sendFile(`${__dirname}/app/index.html`);
});

// error handlers ======================

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send({
        message: err.message,
        error: err
    });
});

// start ===============================

app.listen(port);
console.log('Listening on port 5000.');
exports = module.exports = app;
