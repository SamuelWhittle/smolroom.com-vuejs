<script setup>
  import { PerlinNoise, map } from '@/assets/classes/PerlinNoise';
</script>

<script>
  export default {
    data() {
      return {
        time: 0,
        scale: 25,
      }
    },
    mounted() {
      this.canvas = null;
      this.ctx = null;
      this.seed = null;
      this.noise = null;

      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.adjustCanvasResolution();
      this.main();

      window.addEventListener('resize', () => {
        this.adjustCanvasResolution();
        this.main();
      });
    },
    methods: {
      adjustCanvasResolution() {
        this.canvas.width = this.$refs.canvasContainer.clientWidth;
        this.canvas.height = this.$refs.canvasContainer.clientHeight;
      },

      changeResolution() {
        this.draw();
      },

      changeTime() {
        this.draw();
      },

      draw() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();

        for(var x = 0; x < this.canvas.width; x += Number(this.scale)) {
            for(var y = 0; y < this.canvas.height; y += Number(this.scale)) {
                let color = this.noise.getNoisePixel([x,y, this.time]);
                let r, g, b;
                r = g = b = map(color, -1, 1, 0, 255);
                this.ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
                this.ctx.fillRect(x, y, Number(this.scale), Number(this.scale));
            }
        }

        this.ctx.closePath();
      },

      main() {
        this.seed = Math.floor(Math.random() * 9999999999999999);

        this.noise = new PerlinNoise([this.canvas.width, this.canvas.height, 1000], 100, 3, 1/3, this.seed);

        this.draw();
      },
    }
  }
</script>

<template>
  <div class="flex flex-dir-column">
    <div class="canvasContainer" ref="canvasContainer">
        <canvas id="mainCanvas" class="mainCanvas"></canvas>
    </div>

    <div class="controls flex flex-dir-column">
        <div class="timelineContainer flex flex-justify-space-between">
            <label for="timeline">Timeline:</label>
            <input type="range" id="timeline" min="0" max="1000" step="10" v-model="time" @input="changeTime"/>
        </div>
        <div class="resolutionContainer flex flex-justify-space-between">
            <label for="resolution">Resolution:</label>
            <input type="range" id="resolution" min="1" max="25" step="1" v-model="scale" @input="changeResolution"/>
        </div>
        <button id="redraw" class="newNoise" @click='main'>New Noise!</button>
    </div>
  </div>
</template>

<style scoped src="@/assets/css/perlin-noise-zero.css"></style>
