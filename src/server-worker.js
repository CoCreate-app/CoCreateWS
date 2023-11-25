'use strict';

const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master process is running with PID: ${process.pid}`);
    console.log(`Forking ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        // Forking the worker and passing the worker ID as an environment variable
        const worker = cluster.fork({ WORKER_ID: i + 1 });

        // Logging the path that could be used for routing
        console.log(`Worker ${worker.process.pid} will handle path /worker${i + 1}`);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    // Each worker can use the WORKER_ID environment variable to determine its unique path
    const workerId = process.env.WORKER_ID;

    const server = http.createServer();

    const components = require("./components");
    components.init(cluster, server);

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Worker ${process.pid} (ID: ${workerId}) started, listening on PORT ${process.env.PORT || 3000}`);
    });
}
