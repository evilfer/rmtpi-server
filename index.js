const express = require('express');
const http = require('http');
const ws = require('ws');
const StreamManager = require('./stream-manager');

const {CLIENT_TOKEN} = process.env;

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({
  server,
  path: `/${CLIENT_TOKEN}`
});

let clientWs = null;
let clientStatus = 'disconnected';

const streamManager = new StreamManager(() => {
  console.log('requesting stream start');
  clientWs.send('stream');
});

wss.on('connection', (ws) => {
  if (clientWs) {
    ws.close();
    return;
  }

  clientWs = ws;
  console.log('connected!');
  clientStatus = 'connected';

  ws.on('message', msg => {
    clientStatus = `connected: ${msg}`;
  });

  ws.on('close', () => {
    clientWs = null;
    console.log('disconnected');
    streamManager.reset();
    clientStatus = 'disconnected';

    // TODO: handle waiting streams
  })
});


app.get('/', (req, res) => {
  res.send(clientStatus);
});

app.post('/stream.mpg', (req, res) => {
  console.log('received stream');
  streamManager.setInput({input: req, stop: () => res.end()});
});

app.get('/stream.mpg', (req, res) => {
  if (!clientWs) {
    return res.status(500).send('No client');
  }

  streamManager.addOutput(res);
  req.on('close', () => {
    console.log('output disconnected');
    streamManager.removeOutput(res);
  })
});


server.listen(process.env.PORT || 5000, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
