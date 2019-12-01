const NotificationClickViewHistory = require('../models/NotificationViewClickHistory');
const {toObjectId} = require('../services/mongo/util');
const {fetchFromSQSQueue} = require('../services/aws/util');

async function consumeMessagesFromQueue() {
    try {
        const messages = await fetchFromSQSQueue();
        if (messages.length < 1) return;
        return await saveToDB(messages);

    } catch (err) {
        throw err;
    }
}

/**
 * messages is array of objects:
 *      {
            "notification_id": "5349b4ddd2781d08c09890f3",
            "site_id": "5349b4ddd2781d08c09890f4",
            "subscriber_id": "5349b4ddd2781d08c09890f5",
            date: "2019-12-01T13:13:27.261Z",
            type: "view|click"
        }
 * @param messages
 * @returns {Promise<void>}
 */
async function saveToDB(messages) {
    const promises = [];
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const filter = {
            notification_id: toObjectId(message.notification_id),
            subscriber_id: toObjectId(message.subscriber_id),
            site_id: toObjectId(message.site_id),
        };

        const updateField = message.type === 'view'
            ? "viewed_on"
            : "clicked_on";

        const doc = {};
        doc[updateField] = new Date(message.date);
        const update = {$set: doc};

        /*
        this query will be fast because
        it will use {notification_id: 1, subscriber_id: 1} compound index to fulfil the filter criterion
        */
        promises.push(NotificationClickViewHistory.findOneAndUpdate(
            filter,
            update,
            {new: true, upsert: true}
        ));
    }
    await Promise.all(promises);
}

module.exports = {
    consumeMessagesFromQueue
};
