declare var io:any;

var socket = io('https://pollster-server-dbrxqijicj.now.sh');

socket.on('avg', function({avg}) {
  document.body.textContent = avg;
});
