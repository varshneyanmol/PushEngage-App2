const cluster = require('cluster');

const masterIdentity = `[Consumer Master ${process.pid}]:`;

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

let workers = [];

logInfo(`master is running in ${process.env.NODE_ENV} mode...`);
logInfo(`number of workers: ${numWorkers}`);

forkWorkers();

function forkWorkers() {
    for (let i = 0; i < numWorkers; i++) {
        fork(i);
    }
}

function fork(i) {
    workers[i] = cluster.fork();
}
