const mongoose = require('mongoose');

/*
This is the schema for notifications view-and-click history containing six fields:
1. _id of the document
2. notification_id : _id from the notification collection (compound index {notification_id: 1, subscriber_id: 1})
3. site_id: _id from the site collection which has sent the notification (Indexed field)
        (NOTE: site_id can also be fetched from the 'Notification' collection,
        but I have kept it here too to increase query time efficiency)
4. subscriber_id: _id from the subscriber collection who has taken action(view/click) on the notification
5. viewed_on: Date-Time at which subscriber viewed the notification
6. clicked_on: Date-Time at which subscriber clicked on the notification
        (NOTE: clicked_on will ONLY be present for the documents whose subscriber has clicked on the notification)
 */
const notificationViewClickHistorySchema = new mongoose.Schema({
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
    },
    site_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    },
    subscriber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscriber'
    },
    viewed_on: {
        type: Date,
        default: undefined
    },
    clicked_on: {
        type: Date,
        default: undefined
    }
});

notificationViewClickHistorySchema.index({notification_id: 1, subscriber_id: 1});
notificationViewClickHistorySchema.index({site_id: 1});

const NotificationViewClickHistory = mongoose.model('NotificationViewClickHistory', notificationViewClickHistorySchema);
module.exports = NotificationViewClickHistory;
