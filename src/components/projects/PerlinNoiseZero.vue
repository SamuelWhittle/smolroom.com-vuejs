<template>
    <canvas id="mainCanvas" class="main-canvas"></canvas>
    <div class="displayPerformance" :class="{hidePerformance: performanceDisplay}">{{performance}}</div>
</template>

<script>
  import { PerlinNoise, map } from '@/assets/classes/PerlinNoise';
  
  export default {
    props: {
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
        default: Math.floor(Math.random() * 900000009 * 11111111),
      },
      time: {
        type: Number,
        required: true,
      },
      scale: {
        type: Number,
        required: true,
      },
      performanceDisplay: {
          type: Boolean,
          default: false,
      },
    },
    data() {
      return {
        noiseWidth: null,
        noiseHeight: null,
        performance: 0,
      }
    },
    watch: {
      seed: {
        handler() {
          this.main();
        }
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
        this.begin = null;
        this.noise = null;

        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.main();

        this.parentResizeObserver = new ResizeObserver(() => {
            this.canvas.width = this.$el.parentNode.clientWidth;
            this.canvas.height = this.$el.parentNode.clientHeight;

            this.main();
        });

        this.parentResizeObserver.observe(this.$el.parentNode);
    },
    beforeUnmount() {
        this.parentResizeObserver.disconnect();
    },
    methods: {
        draw() {
            this.begin = performance.now();
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for(var x = 0; x < this.canvas.width; x += Number(this.scale)) {
                for(var y = 0; y < this.canvas.height; y += Number(this.scale)) {
                    let color = this.noise.getNoisePixel([x,y, this.time]);
                    let r, g, b;
                    r = g = b = map(color, -1, 1, 0, 255);
                    this.ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
                    this.ctx.fillRect(x, y, Number(this.scale), Number(this.scale));
                }
            }
            this.performance = performance.now() - this.begin;
        },

      main() {
        this.noise = new PerlinNoise([this.canvas.width, this.canvas.height, this.noiseDepth], this.startingOctave, this.numOctaves, this.octaveScale, this.seed);

        this.draw();
      },
    }
  }
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
