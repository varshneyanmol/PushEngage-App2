const cluster = require('cluster');

const {sendToWorker, masterCommands, workerCommands} = require('./command');

const masterIdentity = `[Producer Master ${process.pid}]:`;

function logInfo(message) {
    console.log(`${masterIdentity} ${message}`);
}

/*
in staging mode: number of workers will be 2
in production mode: number of workers = number of logical CPUs
 */
let numWorkers = 2;
if (process.env.NODE_ENV === 'production') {
    numWorkers = (require('os').cpus().length) / 2;
}

let listeningWorkers = 0;
let workers = [];

logInfo(`master is running in ${process.env.NODE_ENV} mode...`);
logInfo(`number of workers: ${numWorkers}`);

forkWorkers();

function forkWorkers() {
    for (let i = 0; i < numWorkers; i++) {
        fork(i);
    }
}


/**
 * forks a workers and attaches an exit listener to it.
 * If any worker dies abruptly or unintentionally then a replacement of that worker is forked immediately
 * @param i = workerIndex
 */
function fork(i) {
    workers[i] = cluster.fork();

    workers[i].on('online', function () {
        logInfo(`worker ${this.process.pid} is online`);

        this.on('message', function (message) {
            processWorkerCommand.call(this, message);
        });

    });

    workers[i].on('exit', function (code, signal) {
        logInfo(`worker ${this.process.pid} died with code ${code} and signal ${signal}`);
        if (!this.exitedAfterDisconnect) {
            logInfo(`spawning a replacement of the dead worker ${this.process.pid}`);
            fork(i);
        } else {
            logInfo(`worker ${this.process.pid} died intentionally`);
        }
    });
}

/**
 * Worker send few commands to the master which are processed here:
 * every worker sends "LISTENING" command to master when that worker is ready to accept connections
 * every worker sends "SHUTDOWN_CLEANUP_SUCCESS" or "SHUTDOWN_CLEANUP_FAILED" in response to master's "SHUTDOWN_CLEANUP" command to shutdown the worker.
 * @param message
 */
function processWorkerCommand(message) {
    if (!message.command) return;

    logInfo(`received command ${message.command} from ${message.from}`);

    switch (message.command) {
        case workerCommands.LISTENING:
            checkIfReady();
            break;

        case workerCommands.SHUTDOWN_CLEANUP_SUCCESS:
            this.disconnect();
            break;

        case workerCommands.SHUTDOWN_CLEANUP_FAILED:
            break;

        default:
            logInfo(`received unknown command "${message.command}" from ${message.from}`);
    }
}

/**
 Gets called when a worker is ready to accept connections.
 */
function checkIfReady() {
    listeningWorkers++;

    //If All workers are ready to accept connections, signal pm2 that the application is ready for the outside world.
    if (listeningWorkers === numWorkers) {
        logInfo('All workers are listening');
        process.send('ready');
    }
}

/**
 * to stop/kill the application, PM2 sends 'SIGINT' signal to all the running processes but
 * only master performs action on that signal whereas all workers ignore that signal.
 * To stop/kill a worker, master sends "SHUTDOWN_CLEANUP" command to all the workers and waits for the workers to terminate themselves.
 * In case any worker does not terminate itself within 3 seconds, then master forcefully kills that worker.
 */
process.on('SIGINT', function () {
    logInfo('RECEIVED SIGINT SIGNAL');

    const maxWorkerTime = 3000;

    for (let i = 0; i < workers.length; i++) {
        sendToWorker(workers[i], masterCommands.SHUTDOWN_CLEANUP);
        setTimeout(function () {
            if (!workers[i].isDead()) {
                logInfo(`worker ${workers[i].process.pid} still alive after ${maxWorkerTime}ms. Sending SIGKILL to kill it forcefully...`);
                workers[i].kill('SIGKILL');
            }
        }, maxWorkerTime);
    }

    setInterval(() => {
        let allDone = true;
        for (let i = 0; i < workers.length; i++) {
            if (!workers[i].isDead()) {
                allDone = false;
                break;
            }
        }

        logInfo(`all workers terminated? ${allDone}`);
        if (allDone) {
            logInfo(`exiting now...`);
            process.exit(0);
        }
    }, 100);

});
