'use strict';

// Imports ======================

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import helmet from 'helmet';
import http from 'http';
import Socket from 'socket.io';
import Repeat from 'repeat';
import moment from 'moment';
import async from 'async';

import router from './routes';

import Notification from './models/notification';
import User from './models/user';

import {setSocket, getSocket} from './socket';
import {saveNotification} from'./routes/routes.users.notifications';

import {MONGO_URI} from './config';

// main variables
const port = process.env.PORT || 5000;
let app = express();
let server = http.Server(app);
let io = new Socket(server);

// Configuration ======================

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.resolve('client')));

// Routers ======================

app.use('/api/', router);

// angular - html5mode reload fix
app.use((req, res) => {
    res.sendFile(path.resolve('client/index.html'));
});

// Error handling ======================

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send({
        message: err.message,
        error: err
    });
});

// Socket.io config ======================

io.on('connection', (socket) => {

    socket.on('setUserId', (id) => {
        setSocket(id, socket.id);
    });

    socket.on('notification', (msg) => {

        // save notification to the DB
        saveNotification(msg.from, msg.to, msg.type, msg.imageid, (msg.comment || ''));

        // send the notification to the user
        getSocket(msg.to)
            .then(res => {
                io.to(res.socketid).emit('notification', {'from': msg.author, 'type': msg.type, 'to': res.username, 'imageid': msg.imageid, 'comment': msg.comment});
            })
            .catch(error => {
                console.log('Error:' + error);
            });
    })
});

// Repeat config ======================

Repeat(()=> {
    let date = moment().subtract(30, 'days').toDate();

    console.log('Removing old notifications and feed items added before the date of: ', date);

    // Remove old notifications
    Notification.remove({date: {$lt: date}}, (err) => {
        if (err) console.log('Error while deleting notifications: ', err);
        else console.log('Successfully removed old notifications!');
    });

    // Remove old feed images
    // First, select all the items from the feeds that are older than given date
    User.find({})
        .populate({
            path: 'feed',
            match: {date: {$lt: date}},
            select: '_id'
        })
        .select('feed')
        .exec((err, data) => {

           // go through all the selected users and remove the old images from the feeds
           async.each(data, (user, callback) => {

               // the array of the old feed items
               let arr = user.feed.map(x => x._id);

               // remove feed items that are part of the old images array
               User.update({_id: user._id}, {$pull: {feed: {$in: arr}}}, err => {
                  if (err) console.log('Error while deleting feed elements: ', err);
               });
           }, (err) => {
               if (err) console.log('Error: ', err);
               console.log('Successfully removed old feed items!');
           });
        });

}).every(24, 'h').start.now(); // Run every day once

// Start server ==========================

server.listen(port, () => {
    console.log('Listening on port 5000.');
});