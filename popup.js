'use strict';
const HEIGHT = 300;
const WIDTH = 480;
const GRID_COLOR = '#eee';

const canvas = document.getElementById('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
const ctx = canvas.getContext('2d');

function drawGrid() {
  ctx.lineWidth = 1;
  const interval = WIDTH / 10;
  for (let i = 1; i * interval < WIDTH / 2; i++) {
    const x1 = (WIDTH / 2) + (interval * i);
    const x2 = (WIDTH / 2) - (interval * i);
    drawLine(x1, 0, x1, HEIGHT);
    drawLine(x2, 0, x2, HEIGHT);
  }
  for (let i = 1; i * interval < HEIGHT; i++) {
    const y = HEIGHT - (i*interval)
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
  const gradient = ctx.createLinearGradient(0,0,WIDTH,0);
  gradient.addColorStop(0, '#ddddff');
  gradient.addColorStop(1, '#ffdddd');

  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,WIDTH,HEIGHT);
}

drawGradient();
drawGrid();
drawAxes();
