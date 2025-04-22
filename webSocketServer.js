import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3030 });

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify({ message: 'Client connected' }));

  ws.on('message', function message(data) {
    const msgObject = JSON.parse(data);

    switch (msgObject.action) {
      case 'reload':
        ws.send(JSON.stringify({ message: 'reload', id: msgObject.id }));
        break;

      case 'connection':
        console.log('Client connected');
        ws.send(JSON.stringify({ message: 'Hello client '}));
        break;
      default:
        ws.send(JSON.stringify({ message: false }));
    }

    console.log('received: %s', data);
  });

  ws.on('error', console.error);
});
