'use strict';
const HEIGHT = 320;
const WIDTH = 480;
const GRID_COLOR = '#eee';
const INTERVAL = WIDTH / 10;

const canvas = document.getElementById('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
const ctx = canvas.getContext('2d');

function drawGrid() {
  ctx.lineWidth = 1;
  for (let i = 1; i * INTERVAL < WIDTH / 2; i++) {
    const x1 = (WIDTH / 2) + (INTERVAL * i);
    const x2 = (WIDTH / 2) - (INTERVAL * i);
    drawLine(x1, 0, x1, HEIGHT);
    drawLine(x2, 0, x2, HEIGHT);
  }
  for (let i = 1; i * INTERVAL < HEIGHT; i++) {
    const y = HEIGHT - (i*INTERVAL)
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
  blue.addColorStop(0, '#bbbbdd');
  blue.addColorStop(1, '#ffffff');
  const red = ctx.createLinearGradient(WIDTH/2,0,WIDTH,0);
  red.addColorStop(0, '#ffffff');
  red.addColorStop(1, '#ddbbbb');

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
  const horizontalScaleFactor = 5.45;
  const verticalScaleFactor = 5;
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
