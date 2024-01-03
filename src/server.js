'use strict';
const cluster = require('cluster');
const os = require('os');
const server = require("@cocreate/server")
const config = require("@cocreate/config");

const modules = require("./modules");

async function init() {
    let workers = await config('workers')
    workers = workers.workers
    if (!workers || workers === 'false') {
        workers = 1
    } else
        workers = workers = parseInt(workers) || os.cpus().length;

    if (cluster.isMaster) {
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
        cluster.totalWorkers = workers

        await modules.init(cluster, server);

        // Each worker can use the WORKER_ID environment variable to determine its unique path
        const workerId = process.env.WORKER_ID;

        // Start HTTPS server on port 8443
        server.https.listen(8443, () => {
            console.log(`Worker ${process.pid} (ID: ${workerId}) HTTPS Server is listening on PORT 8443`);
        });

        // Start HTTP server on port 8080
        server.http.listen(8080, () => {
            console.log(`Worker ${process.pid} (ID: ${workerId}) HTTP Server is listening on PORT 8080`);
        });
    }
}

init()
