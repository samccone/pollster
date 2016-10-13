declare var io:any;

var socket = io('https://pollster-server-dbrxqijicj.now.sh');
const results = document.querySelector('#results') as HTMLCanvasElement;

var height = window.innerHeight;
var width = window.innerWidth;
var lastY: number = 0;
var rafId: number | null = null;
var previous: Array<number> = [];
var sampleRate = 50;
var sampleCount = 0;
var filled = false;
results.setAttribute('height', `${height}px`);
results.setAttribute('width', `${width}px`);

const ctx = results.getContext('2d');
ctx.lineWidth = 5;
var score = 0.5;

var grd = ctx.createLinearGradient(0,0,0,height);
grd.addColorStop(0, '#009688');
grd.addColorStop(1, '#F44336');
ctx.fillStyle = grd;
ctx.strokeStyle= grd;

window.addEventListener('resize', () => {
  height = window.innerHeight;
  width = window.innerWidth;
  results.setAttribute('height', `${height}px`);
  results.setAttribute('width', `${width}px`);
  grd = ctx.createLinearGradient(0,0,0,height);
  grd.addColorStop(0, '#009688');
  grd.addColorStop(1, '#F44336');
  ctx.fillStyle = grd;
  ctx.strokeStyle = grd;
  ctx.lineWidth = 5;
});

socket.on('avg', function({avg}) {
  score = avg;
});

function drawPrevious() {
  ctx.beginPath();
  previous.forEach((v, i) => {
    if (i === 0) {
      ctx.moveTo(i, v * height);
    } else {
      ctx.lineTo(i * 10, v * height);
    }
  });
  // Draw up to the orb.
  ctx.lineTo(previous.length * 10, Math.floor(score * height));
  ctx.stroke();
  ctx.closePath();
}


function tick() {
  if (rafId !== null) {
    return;
  }

  rafId = requestAnimationFrame(() => {
    rafId = null;
    ctx.clearRect(0, 0, width, height);
    drawPrevious();
    ctx.beginPath()
    ctx.arc(previous.length * 10, Math.floor(score * height), 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    sampleCount++;

    if (!filled) {
      previous.push(score);
    } else if (sampleCount >= sampleRate) {
      sampleCount = 0;
      previous.push(score);
    }

    while (previous.length * 10 > width * .9) {
      filled = true;
      previous = previous.slice(1);
    }
  });
}

setInterval(tick, 16.66);
