(function () {
    'use strict';

    const mongoose = require('mongoose');

    module.exports = new mongoose.Schema({
        author: String,
        authorAvatar: String,
        text: String,
        date: {type: Date, default: Date.now}
    });

})();
