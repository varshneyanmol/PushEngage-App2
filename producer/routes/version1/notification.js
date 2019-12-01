const express = require('express');
const router = express.Router();
const {
    postView,
    postClick,
    getViewCountByNotificationId,
    getClickCountByNotificationId,
    getViewAndClickCountByNotificationId,
    getViewCountBySiteId,
    getClickCountBySiteId,
    getViewAndClickCountBySiteId
} = require('../../controllers/version1/notification_controller');

/**
 Recording View of a Notification is a POST request.
 It takes following data with content-type: application/json
 {
    "notification_id": "5349b4ddd2781d08c09890f3",
    "site_id": "5349b4ddd2781d08c09890f4",
    "subscriber_id": "5349b4ddd2781d08c09890f5"
}
 This function Pushes this "Notification View" request to the AWS SQS queue to processed further by some worker of the consumer App
 And sends the acknowledgement back to the client that its request will be processed.
 */
router.post('/view', (req, res) => {
    postView(req.body)
        .then(result => {
            res.status(200).send(result)
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});


/**
 Recording Click of a Notification is a POST request.
 It takes following data with content-type: application/json
 {
    "notification_id": "5349b4ddd2781d08c09890f3",
    "site_id": "5349b4ddd2781d08c09890f4",
    "subscriber_id": "5349b4ddd2781d08c09890f5"
}
 This function Pushes this "Notification Click" request to the AWS SQS queue to processed further by some worker of the consumer App
 And sends the acknowledgement back to the client that its request will be processed.
 */
router.post('/click', (req, res) => {
    postClick(req.body)
        .then(result => {
            res.status(200).send(result)
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});


router.get('/view', (req, res) => {
    getViewCountByNotificationId(req.query.notificationId)
        .then(count => {
            res.status(200).send({views: count})
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

router.get('/click', (req, res) => {
    getClickCountByNotificationId(req.query.notificationId)
        .then(count => {
            res.status(200).send({clicks: count})
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

router.get('/ViewAndClick', (req, res) => {
    getViewAndClickCountByNotificationId(req.query.notificationId)
        .then(result => {
            res.status(200).send(result)
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

router.get('/site-view', (req, res) => {
    getViewCountBySiteId(req.query.siteId, req.query.rollBackDays)
        .then(count => {
            res.status(200).send({views: count})
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

router.get('/site-click', (req, res) => {
    getClickCountBySiteId(req.query.siteId, req.query.rollBackDays)
        .then(count => {
            res.status(200).send({clicks: count})
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

router.get('/site-ViewAndClick', (req, res) => {
    getViewAndClickCountBySiteId(req.query.siteId, req.query.rollBackDays)
        .then(result => {
            res.status(200).send(result)
        })
        .catch(err => {
            res.status(400).send(err.message)
        })
});

module.exports = router;
