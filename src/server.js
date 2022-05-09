'use strict';
const express = require('express');
const cors = require('cors')
const urlencoded = require('body-parser').urlencoded;
const { createServer } = require('http');

const app = express();
app.use(cors())
app.use(urlencoded({ extended: false }));
app.use('/', require('./routes/index'));

const socketServer = require("@cocreate/socket-server")
const wsManager = new socketServer("ws");

const server = createServer(app);
server.on('upgrade', function upgrade(request, socket, head) {
  if (!wsManager.handleUpgrade(request, socket, head)) {
    socket.destroy();
  }
});

const { config } = require('../CoCreate.config');
process.env['organization_id'] = config.organization_id;

const components = require("./components")

const {mongoClient} = require("./db")
mongoClient().then(dbClient => {
  components.init(wsManager, dbClient)
});

server.listen(process.env.PORT || 3000);
