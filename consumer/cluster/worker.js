require('../services/mongo/connection');
const {consumeMessagesFromQueue} = require('../controllers/notification_controller');

const workerIdentity = `[Consumer Worker ${process.pid}]:`;

function logInfo(message) {
    console.log(`${workerIdentity} ${message}`);
}

async function iterate() {
    try {
        await consumeMessagesFromQueue();
    } catch (err) {
        throw err;
    }
}


/**
 * This function will run infinitely as it is the consumer
 * and only job it to fetch data from the aws sqs queue
 * and save it into db
 *
 * "LONG POLLING" of 20 seconds is used to fetch data.
 * i.e, if sqs queue is empty then it will wait for 20 seconds for some message to arrive
 *
 *
 * @returns {Promise<void>}
 */
async function start() {
    while (true) {
        try {
            await iterate()
        } catch (err) {
            logInfo('Error while consuming: ' + err);
        }
    }
}

start();

