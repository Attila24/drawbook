var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new mongoose.Schema({
    _author: {type: Schema.Types.ObjectId, ref: 'User'},
    title: String,
    url: String,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Image', ImageSchema);
