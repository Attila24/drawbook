'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import multipart from 'connect-multiparty';
import path from 'path';
import helmet from 'helmet';
import http from 'http';
import socket from 'socket.io';

import {MONGO_URI} from './config';

let app     = express();
const port    = process.env.PORT || 5000;


let server = http.Server(app);
let io = new socket(server);

// Configuration ======================

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(helmet());
app.use(multipart({
    uploadDir: 'client/uploads/avatars'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.resolve('client')));
// Routers ======================

import router from './routes';
app.use('/api/', router);

// angular - html5mode reload fix
app.use((req, res) => {
    res.sendFile(path.resolve('client/index.html'));
});

// error handlers ======================

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send({
        message: err.message,
        error: err
    });
});


import {setSocket, getSocket, saveNotification} from './socket';

io.on('connection', (socket) => {

    socket.on('setUserId', (id) => {
        setSocket(id, socket.id);
    });

    socket.on('notification', (msg) => {

        saveNotification(msg.from, msg.to, msg.type, msg.imageid, (msg.comment || ''));

        getSocket(msg.to)
            .then(res => {
                io.to(res.socketid).emit('notification', {'from': msg.author, 'type': msg.type, 'to': res.username, 'imageid': msg.imageid, 'comment': msg.comment});
            })
            .catch(error => {
                console.log('Error:' + error);
            });
    })
});

// start ===============================

server.listen(port, () => {
    console.log('Listening on port 5000.');
});
