var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    author: String,
    authorAvatar: String,
    text: String,
    date: {type: Date, default: Date.now}
});

module.exports = CommentSchema;