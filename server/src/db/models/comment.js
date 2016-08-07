'use strict';

import mongoose from 'mongoose';

export default new mongoose.Schema({
    author: String,
    authorAvatar: String,
    text: String,
    date: {type: Date, default: Date.now}
});