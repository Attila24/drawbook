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
import Repeat from 'repeat';
import moment from 'moment';
import async from 'async';

import Notification from './db/models/notification';
import User from './db/models/user';

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


import {setSocket, getSocket} from './socket';
import {saveNotification} from'./routes/routes.users.notifications';

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

Repeat(()=> {
    let date = moment().subtract(30, 'days').toDate();

    console.log('Removing old notifications and feed items added before the date of: ', date);

    Notification.remove({date: {$lt: date}}, (err) => {
        if (err) console.log('Error while deleting notifications: ', err);
        else console.log('Successfully removed old notifications!');
    });

    User.find({})
        .populate({
            path: 'feed',
            match: {date: {$lt: date}},
            select: '_id'
        })
        .select('feed')
        .exec((err, data) => {

           async.each(data, (user, callback) => {
               let arr = user.feed.map(x => x._id);
               User.update({_id: user._id}, {$pull: {feed: {$in: arr}}}, err => {
                  if (err) console.log('Error while deleting feed elements: ', err);
               });
           }, (err) => {
                console.log('Successfully removed old feed items!');
           });
        });

}).every(24, 'h').start.now(); // every day once

// start ===============================

server.listen(port, () => {
    console.log('Listening on port 5000.');
});
