'use strict';

import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    authorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    authorAvatarPath: String,
    authorUsername: String,
    text: String,
    date: {type: Date, default: Date.now},
    imageId: {type: mongoose.Schema.Types.ObjectId, ref: 'Image'}
});

export default mongoose.model('Comment', CommentSchema);