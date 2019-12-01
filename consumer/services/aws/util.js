const aws = require('aws-sdk');
aws.config.loadFromPath(process.env.AWS_CONFIG_FILE_PATH);
const sqs = new aws.SQS({apiVersion: '2012-11-05'});

function fetchFromSQSQueue() {
    return new Promise((resolve, reject) => {
        const params = {
            QueueUrl: createQueueUrl(),
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 0,
            WaitTimeSeconds: 20
        };

        sqs.receiveMessage(params, async (err, data) => {
            if (err)
                return reject(err);

            const messages = [];
            if (!data.Messages) // no messages to process
                return resolve(messages);

            for (let i = 0; i < data.Messages.length; i++) {
                const msg = data.Messages[i];
                messages.push(JSON.parse(msg.Body));
                await deleteMessageFromSQSQueue(msg);
            }

            resolve(messages);

        });
    });
}

function deleteMessageFromSQSQueue(message) {
    return new Promise((resolve, reject) => {
        const deleteParams = {
            QueueUrl: createQueueUrl(),
            ReceiptHandle: message.ReceiptHandle
        };

        sqs.deleteMessage(deleteParams, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function createQueueUrl() {
    return `https://sqs.us-east-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.AWS_SQS_QUEUE_NAME}`;
}

module.exports = {
    fetchFromSQSQueue
};
