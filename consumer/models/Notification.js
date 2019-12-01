const mongoose = require('mongoose');

/*
This is dummy schema for notification containing only four fields:
1. _id of the notification (Automatically generated, so no need to define here)
2. site_id: _id from site collection which has sent the notification
3. title : title of the notification (required field)
4. message: message of the notification
5. created_at: just date of document creation
 */
const notificationSchema = new mongoose.Schema({
    site_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    },
    title: {
        type: String,
        require: true
    },
    message: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
