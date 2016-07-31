var mongoose        = require('mongoose'),
    Schema          = mongoose.Schema,
    CommentSchema   = require('./comment');

var ImageSchema = new mongoose.Schema({
    _author: {type: Schema.Types.ObjectId, ref: 'User'},
    title: String,
    url: String,
    date: {type: Date, default: Date.now},
    comments: [CommentSchema]
});

module.exports = mongoose.model('Image', ImageSchema);
