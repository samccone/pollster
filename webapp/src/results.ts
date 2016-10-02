declare var io:any;

var socket = io('http://localhost:9999');

socket.on('avg', function({avg}) {
  document.body.textContent = avg;
});
