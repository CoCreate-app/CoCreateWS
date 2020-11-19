'use strict';

const session = require('express-session');
const express = require('express');
const http = require('http');
const uuid = require('uuid');

const WebSocket = require('ws');

const app = express();
const map = new Map();

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});

//
// Serve static files from the 'public' folder.
//
app.use(express.static('public'));
app.use(sessionParser);

app.post('/login', function(req, res) {
  //
  // "Log in" user and set userId to session.
  //
  const id = uuid.v4();

  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.send({ result: 'OK', message: 'Session updated' });
});

app.delete('/logout', function(request, response) {
  const ws = map.get(request.session.userId);
  request.session.destroy(function() {
    if (ws) ws.close();
    response.send({ result: 'OK', message: 'Session destroyed' });
  });
});

//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function(request, socket, head) {
  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    wss.handleUpgrade(request, socket, head, function(ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function(ws, request) {
  const userId = request.session.userId;

  map.set(userId, ws);

  ws.on('message', function(message) {
    //
    // Here we can now use session parameters.
    //
    console.log(`Received message ${message} from user ${userId}`);
  });

  ws.on('close', function() {
    map.delete(userId);
  });
});

//
// Start the server.
//
server.listen(8080, function() {
  console.log('Listening on http://localhost:8080');
});