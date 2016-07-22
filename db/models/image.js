var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new mongoose.Schema({
    _author: {type: Schema.Types.ObjectId, ref: 'User'},
    title: String,
    url: String
});

module.exports = mongoose.model('Image', ImageSchema);
