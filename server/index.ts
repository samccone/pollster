import * as http from 'http'
import * as SocketIO from 'socket.io';
import * as fs from 'fs';

var server = http.createServer(handler)
var io = SocketIO(server);
var voteMap = {};
var emitScheduleId = null;
const THROTTLE_RATE = 400;

server.listen(process.env.PORT || 9999);

function handler(req, res) {
  res.end(`avg ${getAverageVote()}`);
}

function getAverageVote() {
  const ids = Object.keys(voteMap);
  const sum = ids.reduce(((prev, key) => prev + voteMap[key]), 0);

  if (ids.length === 0) {
    return 0.5;
  }

  return sum / ids.length;
}

function throttledBrodcast() {
  if (emitScheduleId === null) {
    emitScheduleId = setTimeout(emitAverage, THROTTLE_RATE);
  }
}

function emitAverage() {
  io.emit('avg', {
    avg: getAverageVote(),
    userCount: Object.keys(voteMap).length,
  });
  emitScheduleId = null;
}

io.on('connection', function (socket) {
  socket.on('vote', ({percent}) => {
    percent = Math.min(1, Math.max(0, parseFloat(percent)));
    voteMap[socket.id] = percent;
    throttledBrodcast();
  });

  socket.on('disconnect', () => {
    delete voteMap[socket.id]
  });
});

