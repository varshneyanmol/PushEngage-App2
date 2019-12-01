module.exports.sendToWorker = function (worker, command) {
    worker.send({
        from: process.pid,
        isMaster: true,
        command: command
    });
};

module.exports.sendToMaster = function (command) {
    process.send({
        from: process.pid,
        isMaster: false,
        command: command
    });
};

module.exports.masterCommands = Object.freeze({
    SHUTDOWN_CLEANUP: 'SHUTDOWN_CLEANUP'
});

module.exports.workerCommands = Object.freeze({
    SHUTDOWN_CLEANUP_SUCCESS: 'SHUTDOWN_CLEANUP_SUCCESS',
    SHUTDOWN_CLEANUP_FAILED: 'SHUTDOWN_CLEANUP_FAILED',
    LISTENING: 'LISTENING'
});
