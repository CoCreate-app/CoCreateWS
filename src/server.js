'use strict';
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const config = require("@cocreate/config");

const modules = require("./modules");

async function init() {
    let proxy
    let workers = await config('workers')
    workers = workers.workers
    if (!workers || workers === 'false') {
        workers = 1
    } else
        workers = workers = parseInt(workers) || os.cpus().length;

    if (cluster.isMaster) {
        const nginx = require('@cocreate/nginx');
        proxy = new nginx()
        console.log(`Master process is running with PID: ${process.pid}`);
        console.log(`Forking ${workers} workers...`);

        for (let i = 0; i < workers; i++) {
            const worker = cluster.fork({ WORKER_ID: i + 1 });
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

        cluster.totalWorkers = workers
        modules.init(cluster, server, proxy);

        server.listen(process.env.PORT || 3000, () => {
            console.log(`Worker ${process.pid} (ID: ${workerId}) started, listening on PORT ${process.env.PORT || 3000}`);
        });
    }
}

init()