import * as http from 'http'
import * as SocketIO from 'socket.io';
import * as fs from 'fs';

var server = http.createServer(handler)
var io = SocketIO(server);
var clientMap = {};

server.listen(process.env.PORT || 9999);

function handler(req, res) {
  res.end(`avg ${getAverageVote()}`);
}

function getAverageVote() {
  const ids = Object.keys(clientMap);
  const sum = ids.reduce(((prev, key) => prev + clientMap[key]), 0);

  if (ids.length === 0) {
    return 0.5;
  }

  return sum / ids.length;
}

io.on('connection', function (socket) {
  clientMap[socket.id] = 0.5;
  socket.on('vote', ({percent}) => {
    percent = Math.min(1, Math.max(0, parseFloat(percent)));
    clientMap[socket.id] = percent;
  });

  socket.on('disconnect', () => delete clientMap[socket.id]);
});

