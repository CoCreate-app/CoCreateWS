'use strict';
const http = require('http');
const server = http.createServer();

const components = require("./components");
components.init('', server);

server.listen(process.env.PORT || 3000);
