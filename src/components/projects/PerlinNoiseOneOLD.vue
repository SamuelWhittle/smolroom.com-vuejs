<template>
  <div class="fullscreen">
    <canvas id="mainCanvas" class="main-canvas"></canvas>
  </div>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
  import { PerlinNoise, map } from '@/assets/classes/PerlinNoise';

  export default {
    props: {
      canvasDivisor: {
        type: Number,
        default: 40,
      },
      fps: {
        type: Number,
        default: 24,
      },
      speed: {
        type: Number,
        default: 10,
      },
    },
    mounted() {
      this.angleNoise = null;
      this.colorNoise = null;
      this.intensityNoise = null;

      this.dims = new Array(2).fill(0);
      this.counter = 0;
      this.interval = null;

      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.canvas.width = this.canvas.parentNode.clientWidth;
      this.canvas.height = this.canvas.parentNode.clientHeight;

      this.calculateConstants();

      this.parentResizeObserver = new ResizeObserver(() => {
        this.canvas.width = this.canvas.parentNode.clientWidth;
        this.canvas.height = this.canvas.parentNode.clientHeight;

        this.calculateConstants();
        this.drawLines();
      });

      this.parentResizeObserver.observe(this.canvas.parentNode);
      console.log(this.canvas);

      if (this.fps > 0) {
        this.interval = setInterval(() => this.drawLines(), 1000/this.fps);
      }

      this.drawLines();
    },
    beforeUnmount() {
      this.parentResizeObserver.disconnect();

      clearInterval(this.interval);
    },
    methods: {
      drawLines() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for(let x = 0; x < this.dims[0]; x ++) {
          for(let y = 0; y < this.dims[1]; y ++) {
            // All noise values will start between -1 and 1

            // Get angle noise value and adjust contraints from -1 to 0 and from 1 to Math.PI*2
            let angle = this.angleNoise.getNoisePixel([x, y, this.counter / 2]);
            angle = map(angle, -1, 1, 0, Math.PI*2);

            // Get color noise value and adjust contraints from -1 to 150 and from 1 to 250
            let color = this.colorNoise.getNoisePixel([x, y, this.counter]);
            color = map(color, -1, 1, 150, 250);

            // Get intensity noise value
            let intensity = this.intensityNoise.getNoisePixel([x, y, this.counter]);
            // adjust intensity contraints from -1 to 0 and from 1 to 10, this is for line width
            let lineWidth = Math.floor(map(intensity, -1, 1, 3, 10));
            // adjust intensity contraints from -1 to 0 and from 1 to 150, this is for line length
            let length = Math.floor(map(intensity, -1, 1, 0, 300));
            // adjust intensity contraints from -1 to 0 and from 1 to 1, this is for line opacity
            let opacity = map(intensity, -1, 1, -0.5, 1);

            // set line width and color
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`

            // calculate the endpoint of the line
            let lineEndX = x * this.canvasDivisor + Math.cos(angle) * length;
            let lineEndY = y * this.canvasDivisor + Math.sin(angle) * length;

            // Draw the inital line
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.canvasDivisor, y * this.canvasDivisor);
            this.ctx.lineTo(lineEndX, lineEndY);
            this.ctx.stroke();
            this.ctx.closePath();

            // Set accent color
            this.ctx.fillStyle = `hsla(${color}, 100%, 100%, ${opacity})`
            // Draw accent
            this.ctx.beginPath();
            this.ctx.arc(lineEndX, lineEndY, lineWidth/2, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.closePath();
          }
        }
        
        this.counter += this.speed / 100;
        this.counter = this.counter%1001;
      },
      calculateConstants() {
        this.dims[0] = Math.ceil(this.canvas.width / this.canvasDivisor) + 3;
        this.dims[1] = Math.ceil(this.canvas.height / this.canvasDivisor) + 3;
        this.angleNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 10, 2, 1/2, 0);
        this.colorNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 20, 2, 1/2, 1);
        this.intensityNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 10, 2, 1/2, 2);
      },
      adjustCanvasSize() {

      },
    },
  }
</script>
