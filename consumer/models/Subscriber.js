const mongoose = require('mongoose');

/*
This is dummy schema for subscriber containing only four fields:
1. _id of the subscriber (Automatically generated, so no need to define here)
2. site_id: _id from site collection which the user belongs to
3. ip : ip of the subscriber
4. createdAt: just date of document creation
 */
const subscriberSchema = new mongoose.Schema({
    site_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    },
    ip: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
module.exports = Subscriber;
