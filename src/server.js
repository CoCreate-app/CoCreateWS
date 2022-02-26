'use strict';
const express = require('express');
const cors = require('cors')
const urlencoded = require('body-parser').urlencoded;
const { createServer } = require('http');

const socketServer = require("@cocreate/socket-server")
const socketManager = new socketServer("ws");
const port = process.env.PORT || 8081;
const adapter = require("./adapter")

const app = express();
app.use(cors())
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/', require('./routes/index'));

const server = createServer(app);
server.on('upgrade', function upgrade(request, socket, head) {
  if (!socketManager.handleUpgrade(request, socket, head)) {
    socket.destroy();
  }
});

adapter.init(socketManager)

server.listen(port);
