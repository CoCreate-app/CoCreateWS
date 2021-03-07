'use strict';

const express = require('express');
const { createServer } = require('http');

const init = require("./init")
const WSManager = require("./core/WSManager")
const urlencoded = require('body-parser').urlencoded;
const wsManager = new WSManager("ws");

const port = process.env.PORT || 8081;

console.log(process.env.PORT)

const app = express();

//app.use(express.json())  
// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.use(express.static('public'));

// app.use('/twilio', require('./plugins/twilio/routes'));

// app.get('/ws/hello', (req, res) => {
//   console.log('connected')
//   res.send('Hello World');
// })

app.use('/', require('./routes/index'));



init.WSManager(wsManager);

const server = createServer(app);


server.on('upgrade', function upgrade(request, socket, head) {
  if (!wsManager.handleUpgrade(request, socket, head)) {
    socket.destroy();
  }
});

server.listen(port);
