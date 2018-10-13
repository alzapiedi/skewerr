'use strict';
const HEIGHT = 320;
const WIDTH = 480;
const GRID_COLOR = '#eee';
const X_INTERVALS = 7;
const Y_INTERVALS = 8;

const canvas = document.getElementById('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
const ctx = canvas.getContext('2d');

function drawGrid() {
  ctx.lineWidth = 1;
  for (let i = 0; i < X_INTERVALS; i++) {
    const x1 = (WIDTH / X_INTERVALS) * i;
    drawLine(x1, 0, x1, HEIGHT);
  }
  for (let i = 1; i < Y_INTERVALS; i++) {
    const y = HEIGHT - (i * HEIGHT / Y_INTERVALS)
    drawLine(0, y, WIDTH, y);
  }
}

function drawLine(x1,y1,x2,y2,color = GRID_COLOR, weight = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle=color;
  ctx.lineWidth = weight;
  ctx.stroke();
}

function drawAxes() {
  drawLine(0, HEIGHT - 1, WIDTH, HEIGHT - 1, '#ccc', 2);
  drawLine(WIDTH / 2, 0, WIDTH / 2, HEIGHT, '#ccc', 2);
}

function drawGradient() {
  const blue = ctx.createLinearGradient(0,0,WIDTH/2,0);
  blue.addColorStop(0, '#9999ee');
  blue.addColorStop(1, '#ffffff');
  const red = ctx.createLinearGradient(WIDTH/2,0,WIDTH,0);
  red.addColorStop(0, '#ffffff');
  red.addColorStop(1, '#ee9999');

  ctx.fillStyle = blue;
  ctx.fillRect(0,0,WIDTH/2,HEIGHT);
  ctx.fillStyle = red;
  ctx.fillRect(WIDTH/2,0,WIDTH,HEIGHT);
}

function drawPoint({ x, y }) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = 'black';
  ctx.fill();
}

function mapHorizontalVerticalToPoint({ horizontal, vertical }) {
  const horizontalScaleFactor = ((WIDTH / 2) / 44) - 0.1;
  const verticalScaleFactor = (HEIGHT / 64) - 0.1;
  const horizontalOffset = WIDTH / 2;
  const x = horizontalOffset + (horizontal * horizontalScaleFactor);
  const y = HEIGHT - (vertical * verticalScaleFactor);
  return { x, y };
}

function clearGraph() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,WIDTH,HEIGHT);
}

function drawCanvas() {
  drawGradient();
  drawGrid();
  drawAxes();
}
