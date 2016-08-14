'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    images: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}],
    avatarPath: {type: String, default: 'img/default-avatar.jpg'},
    timestamp: {type: Date, default: Date.now},
    socketid: String,
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
    lastReadNotificationId: {type: String, default: ''},
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    feed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}]
});

UserSchema.plugin(passportLocalMongoose);

export default mongoose.model('User', UserSchema);