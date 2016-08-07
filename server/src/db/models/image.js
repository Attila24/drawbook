'use strict';

import mongoose from 'mongoose';
import CommentSchema from './comment';

const ImageSchema = new mongoose.Schema({
    _author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: String,
    url: {type: String, unique: true},
    date: {type: Date, default: Date.now},
    comments: [CommentSchema]
});

export default mongoose.model('Image', ImageSchema);
