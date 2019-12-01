const NotificationClickViewHistory = require('../../models/NotificationViewClickHistory');
const {toObjectId, toObjectIdFromDate} = require('../../services/mongo/util');
const {addToSQSQueue} = require('../../services/aws/util');

async function postView(info) {
    return uploadToAWS(info, "view")
}

function postClick(info) {
    return uploadToAWS(info, "click");
}

/**
 * queues the view/click data to the aws sqs queue to processed by the Consumer app.
 * resolves to {acknowledged: true} when queued successfully otherwise rejects with error
 * @param info
 * @param updateField=view|click
 * @returns {Promise<{acknowledged: boolean}>}
 */
async function uploadToAWS(info, updateField) {
    try {
        validateAndModify(info);
        const messageBody = JSON.stringify({
            notification_id: info.notification_id,
            subscriber_id: info.subscriber_id,
            site_id: info.site_id,
            date: new Date().toISOString(),
            type: updateField
        });
        await addToSQSQueue(messageBody);
        return {acknowledged: true};
    } catch (err) {
        throw err;
    }
}


/**
 * This is very simple validation of the request body
 * which simple checks is fields are present and are valid type
 * and changes string ids into objectId
 * @param info
 * @throws err if validation failed
 */
function validateAndModify(info) {
    if (!info || typeof info !== 'object')
        throw new Error("request body is missing or of unsupported type");

    info.notification_id = validateId(info.notification_id, 'notification_id');
    info.site_id = validateId(info.site_id, 'site_id');
    info.subscriber_id = validateId(info.subscriber_id, 'subscriber_id');
}

async function getViewCountByNotificationId(notificationId) {
    return getDocumentCountByNotificationId(notificationId, "viewed_on")
}

async function getClickCountByNotificationId(notificationId) {
    return getDocumentCountByNotificationId(notificationId, "clicked_on")
}

async function getViewAndClickCountByNotificationId(notificationId) {
    try {
        notificationId = validateId(notificationId, 'notificationId');

        let result = await NotificationClickViewHistory.aggregate([
            {$match: {notification_id: notificationId}},
            {
                $facet: {
                    views: [{$match: {viewed_on: {$type: 9}}}, {$group: {_id: null, count: {$sum: 1}}}],
                    clicks: [{$match: {clicked_on: {$type: 9}}}, {$group: {_id: null, count: {$sum: 1}}}]
                }
            },

        ]);

        result = result[0];
        const views = result.views.length > 0
            ? result.views[0].count
            : 0;

        const clicks = result.clicks.length > 0
            ? result.clicks[0].count
            : 0;

        return {
            views,
            clicks
        };

    } catch (err) {
        throw err;
    }
}

async function getDocumentCountByNotificationId(notificationId, countField) {
    try {
        notificationId = validateId(notificationId, 'notificationId');
        const filter = {};
        filter.notification_id = notificationId;
        filter[countField] = {$type: 9};

        /*
        This query will use the {notification_id: 1, subscriber_id: 1} compound index to fulfil the filter criterion
        because "notification_id" field is present in the filter and so fulfills the index-prefix criterion
         */
        return await NotificationClickViewHistory.countDocuments(filter);

    } catch (err) {
        throw err;
    }
}

async function getViewCountBySiteId(siteId, rollBackDays) {
    return getDocumentCountBySiteId(siteId, rollBackDays, "viewed_on")
}

async function getClickCountBySiteId(siteId, rollBackDays) {
    return getDocumentCountBySiteId(siteId, rollBackDays, "clicked_on")
}

async function getDocumentCountBySiteId(siteId, rollBackDays, countField) {
    try {
        siteId = validateId(siteId, 'siteId');
        rollBackDays = validateNumber(rollBackDays, 'rollBackDays');
        const {fromDate, toDate} = calculateDateRange(rollBackDays);

        const fromDateObjectId = toObjectIdFromDate(fromDate);
        const toDateObjectId = toObjectIdFromDate(toDate);

        const filter = {};
        filter.site_id = siteId;
        filter._id = {$gte: fromDateObjectId, $lt: toDateObjectId};
        filter[countField] = {$type: 9};

        return await NotificationClickViewHistory.countDocuments(filter);

    } catch (err) {
        throw err;
    }
}

async function getViewAndClickCountBySiteId(siteId, rollBackDays) {
    try {
        siteId = validateId(siteId, 'siteId');
        rollBackDays = validateNumber(rollBackDays, 'rollBackDays');
        const {fromDate, toDate} = calculateDateRange(rollBackDays);
        const fromDateObjectId = toObjectIdFromDate(fromDate);
        const toDateObjectId = toObjectIdFromDate(toDate);

        let result = await NotificationClickViewHistory.aggregate([
            {$match: {site_id: siteId, _id: {$gte: fromDateObjectId, $lt: toDateObjectId}}},
            {$sort: {site_id: 1}},
            {
                $facet: {
                    views: [{$match: {viewed_on: {$type: 9}}}, {$group: {_id: null, count: {$sum: 1}}}],
                    clicks: [{$match: {clicked_on: {$type: 9}}}, {$group: {_id: null, count: {$sum: 1}}}]
                }
            },

        ]);

        result = result[0];
        const views = result.views.length > 0
            ? result.views[0].count
            : 0;

        const clicks = result.clicks.length > 0
            ? result.clicks[0].count
            : 0;

        return {
            views,
            clicks
        };

    } catch (err) {
        throw err;
    }
}

function calculateDateRange(rollBackDays) {
    const toDate = new Date();
    toDate.setHours(0, 0, 0, 0);

    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - rollBackDays);

    return {
        fromDate,
        toDate
    };
}

function validateId(id, parameterName = 'id') {
    id = toObjectId(id);
    if (!id) throw new Error(`parameter ${parameterName} is missing or of unsupported type.`);
    return id.toString();
}

function validateNumber(strNum, parameterName = 'number') {
    strNum = parseInt(strNum);
    if (isNaN(strNum)) throw new Error(`parameter ${parameterName} is not present or not a number`);
    if (strNum < 1) throw new Error(`parameter ${parameterName} can not be less than 1`);
    return strNum;
}

module.exports = {
    postView,
    postClick,
    getViewCountByNotificationId,
    getClickCountByNotificationId,
    getViewAndClickCountByNotificationId,
    getViewCountBySiteId,
    getClickCountBySiteId,
    getViewAndClickCountBySiteId
};
