'use strict';
var cors = require('cors')

const express = require('express');
const { createServer } = require('http');

const adapter = require("./adapter")
const SocketServer = require("@cocreate/socket-server")
const urlencoded = require('body-parser').urlencoded;
const socketManager = new SocketServer("ws");
const port = process.env.PORT || 8081;

const app = express();
app.use(cors())
app.use(urlencoded({ extended: false }));

app.use(express.static('public'));


/**
app.use('/twilio', require('./plugins/twilio/routes'));
app.get('/ws/hello', (req, res) => {
  console.log('connected')
  res.send('Hello World');
})
**/
app.get('/ws/hello', (req, res) => {
  console.log('connected , Hello word')
  res.send('Hello World');
})

app.use('/', require('./routes/index'));


adapter.init(socketManager).then(({status, instances}) => {
  if (status && instances) {
    socketManager.setPermission(instances.permission)
  }
})

const server = createServer(app);

server.on('upgrade', function upgrade(request, socket, head) {
  if (!socketManager.handleUpgrade(request, socket, head)) {
    socket.destroy();
  }
});

server.listen(port);
