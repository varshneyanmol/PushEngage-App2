const express = require('express');
const {closeMongoDBConnection} = require('../services/mongo/connection');

const {sendToMaster, workerCommands, masterCommands} = require('./command');

const app = express();

const workerIdentity = `[Producer Worker ${process.pid}]:`;

function logInfo(message) {
    console.log(`${workerIdentity} ${message}`);
}

(function () {
    process.on('SIGINT', () => {
        // PM2 sends SIGINT signal to all the running node processes... so catch that signal and ignore...
        // because master will send 'shutdown' message to its worker processes
        logInfo('ignoring SIGINT signal');
    });

    process.on('message', async function (message, connection) {
        if (!message.command) return;

        logInfo(`received command ${message.command} from ${message.from}`);

        if (message.command === masterCommands.SHUTDOWN_CLEANUP) {
            try {
                await shutdownCleanup();
                sendToMaster(workerCommands.SHUTDOWN_CLEANUP_SUCCESS);

            } catch (err) {
                logInfo(`shutdown cleanup failed with error ${err}`);
                sendToMaster(workerCommands.SHUTDOWN_CLEANUP_FAILED);
            }
        } else {
            logInfo(`received unknown command "${message.command}" from ${message.from}`);
        }

    });
})();

async function shutdownCleanup() {
    try {
        await closeMongoDBConnection();
        logInfo("mongoose connection closed");

    } catch (err) {
        throw err;
    }
}

app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(express.json());
app.use(logRequest);

function logRequest(req, res, next) {
    /*
    It is a very simple middleware to log all request only if env is not production
     */
    if (process.env.NODE_ENV !== 'production') {
        logInfo('Request received: ' + req.url);
    }
    next();
}

/*
This is simple API versioning done, in case API changes in future and also need to support old API
 */
app.use('/v1', require('../routes/version1/version1'));
app.use('/', require('../routes/version1/version1'));

const port = process.env.PORT || 3333;
app.listen(port, () => {
    logInfo(`Worker is listening in ${process.env.NODE_ENV} on port ${port}`);
    sendToMaster(workerCommands.LISTENING);
});
