var mongoose                = require('mongoose'),
    passportLocalMongoose   = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    age: Number,
    gender: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', UserSchema);