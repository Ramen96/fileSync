import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3030 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    if (data === 'reload_display_window') {
      console.log('reload_display_window');
    }
    console.log('received: %s', data);
  });

  ws.send(JSON.stringify('something'));
});
