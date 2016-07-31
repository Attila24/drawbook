var mongoose                = require('mongoose'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    images: [{type: Schema.Types.ObjectId, ref: 'Image'}],
    avatarPath: {type: String, default: 'img/default-avatar.jpg'}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', UserSchema);