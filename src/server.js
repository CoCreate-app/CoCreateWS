'use strict';

const express = require('express');
const { createServer } = require('http');
const crudController = require("./crud")
const wsManager = require("./WSManager")
const urlencoded = require('body-parser').urlencoded;
var metricsCocreate = require("./metrics.js");

metricsCocreate();

const app = express();

//app.use(express.json())  
// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.use(express.static('public'));


/*
app.use('/users', require('./src/routes/users'));
app.use('/api', require('./src/routes/api'));
*/
app.use('/stripe', require('./routes/stripe'));
app.use('/twilio', require('./routes/twilio'));

app.use('/js/twilio.min.js', (req, res) => {
  console.log("-----------------------------------")
  res.sendFile('/home/ubuntu/environment/CoCreateWS/node_modules/twilio-client/dist/twilio.min.js');
});

app.use('/', require('./routes/index'));

crudController.WSManager(wsManager);

const server = createServer(app);


server.on('upgrade', function upgrade(request, socket, head) {
  console.log('connected')
  if (!wsManager.handleUpgrade(request, socket, head)) {
    socket.destroy();
  }
});

server.listen(8081);
