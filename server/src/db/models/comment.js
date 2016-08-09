'use strict';

import mongoose from 'mongoose';

export default new mongoose.Schema({
    author: String,
    authorTimestamp: Date,
    text: String,
    date: {type: Date, default: Date.now}
});