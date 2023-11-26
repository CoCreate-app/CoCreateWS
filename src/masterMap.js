const uid = require('@cocreate/uuid')

class MasterMap {
    constructor(cluster) {
        this.cluster = cluster;
        this.map = new Map();
        this.instanceId = uid.generate();
        this.messages = new Map();

        if (cluster.isMaster) {
            cluster.on('message', (worker, message) => {
                if (message.instanceId === this.instanceId) {
                    try {
                        switch (message.method) {
                            case 'set':
                                this.map.set(message.key, message.value);
                                break;
                            case 'get':
                                message.value = this.map.get(message.key);
                                break;
                            case 'delete':
                                this.map.delete(message.key);
                                break;
                            case 'size':
                                message.value = this.map.size();
                                break;
                            case 'clear':
                                this.map.clear();
                                break;
                        }

                        worker.send(message);

                    } catch (error) {
                        message.error = error.message
                        worker.send(message);
                    }
                }
            });
        } else {
            process.on('message', (message) => {
                if (message.instanceId === this.instanceId) {
                    let { resolve, reject } = this.messages.get(message.messageId)
                    this.messages.delete(message.messageId)
                    if (message.error)
                        reject(new Error(message.error));
                    else
                        resolve(message.value);
                }
            });
        }
    }

    set(key, value) {
        return this._mapManager('set', key, value);
    }

    get(key) {
        return this._mapManager('get', key);
    }

    delete(key) {
        return this._mapManager('delete', key);
    }

    size() {
        return this._mapManager('size');
    }

    clear() {
        return this._mapManager('clear');
    }

    _mapManager(method, key, value) {
        return new Promise((resolve, reject) => {
            try {
                const result = this.map[method](key, value);
                if (result)
                    return resolve(result);
                else if (this.cluster.isWorker) {
                    const messageId = uid.generate();
                    process.send({ instanceId: this.instanceId, messageId, method, key, value, });
                    this.messages.set(messageId, { resolve, reject })
                }
            } catch (error) {
                reject(new Error(`${method} operation failed: `, error.message));
            }
        });
    }

}

module.exports = MasterMap;
