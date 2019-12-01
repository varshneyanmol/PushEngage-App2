const aws = require('aws-sdk');
aws.config.loadFromPath(process.env.AWS_CONFIG_FILE_PATH);
const sqs = new aws.SQS({apiVersion: '2012-11-05'});

function addToSQSQueue(message) {
    return new Promise((resolve, reject) => {
        const params = {
            MessageBody: message,
            QueueUrl: `https://sqs.us-east-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.AWS_SQS_QUEUE_NAME}`
        };

        sqs.sendMessage(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.MessageId);
            }
        });
    });
}

module.exports = {
    addToSQSQueue
};
