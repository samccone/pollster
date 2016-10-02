import * as http from 'http'
import * as SocketIO from 'socket.io';
import * as fs from 'fs';

var server = http.createServer(handler)
var io = SocketIO(server);

server.listen(process.env.PORT || 9999);

function handler(req, res) {
  res.end('hello world');
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
