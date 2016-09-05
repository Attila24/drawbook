'use strict';

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
   type: String,
   from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
   to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
   imageid: String,
   date: {type: Date, default: Date.now},
   comment: String
});

export default mongoose.model('Notification', NotificationSchema);