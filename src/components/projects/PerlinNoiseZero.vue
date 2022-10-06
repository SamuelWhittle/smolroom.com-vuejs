<script setup>
  import { PerlinNoise, map } from '@/assets/classes/PerlinNoise';
</script>

<script>
  export default {
    props: {
      noiseWidth: {
        type: Number,
        required: true,
      },
      noiseHeight: {
        type: Number,
        required: true,
      },
      noiseDepth: {
        type: Number,
        default: 1000,
      },
      startingOctave: {
        type: Number,
        default: 100,
      },
      numOctaves: {
        type: Number,
        default: 3,
      },
      octaveScale: {
        type: Number,
        default: 1/3,
      },
      seed: {
        type: Number,
        default: Math.floor(Math.random() * 9999999999999999),
      },
      time: {
        type: Number,
        required: true,
      },
      scale: {
        type: Number,
        required: true,
      }
    },
    watch: {
      noiseWidth: {
        handler() {
          this.adjustCanvasResolution();
          this.main();
        },
      },
      noiseHeight: {
        handler() {
          this.adjustCanvasResolution();
          this.main();
        },
      },
      time: {
        handler() {
          this.draw();
        }
      },
      scale: {
        handler() {
          this.draw();
        }
      },
    },
    mounted() {
      this.canvas = null;
      this.ctx = null;
      this.noise = null;

      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.adjustCanvasResolution();
      this.main();
    },
    methods: {
      adjustCanvasResolution() {
        this.canvas.width = this.noiseWidth;
        this.canvas.height = this.noiseHeight;
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
        this.noise = new PerlinNoise([this.noiseWidth, this.noiseHeight, this.noiseDepth], this.startingOctave, this.numOctaves, this.octaveScale, this.seed);

        this.draw();
      },
    }
  }
</script>

<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
