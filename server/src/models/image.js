'use strict';

import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    _author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: String,
    data: String,
    //url: {type: String, unique: true},
    date: {type: Date, default: Date.now},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

export default mongoose.model('Image', ImageSchema);
