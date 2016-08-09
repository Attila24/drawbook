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
    timestamp: {type: Date, default: Date.now}
});

UserSchema.plugin(passportLocalMongoose);

export default mongoose.model('Users', UserSchema);