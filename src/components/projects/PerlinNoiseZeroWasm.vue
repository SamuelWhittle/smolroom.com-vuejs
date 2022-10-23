<template>
  <div>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
  </div>
</template>

<script>
  import * as wasm from '@/assets/wasm/perlin_noise/perlin_noise_bg.js';

  export default {
    props: {
      seed: {
        type: BigInt,
        default: BigInt(0),
      },
      numOctaves: {
        type: Number,
        default: 3,
      },
      octaveScale: {
        type: Number,
        default: 1/3,
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
      this.canvas = document.getElementById('mainCanvas');
      //this.ctx = this.canvas.getContext('2d');

      this.draw();

      this.parentResizeObserver = new ResizeObserver(() => {
        this.canvas.width = this.$el.parentNode.clientWidth;
        this.canvas.height = this.$el.parentNode.clientHeight;

        //this.main();
        this.draw();
      });

      this.parentResizeObserver.observe(this.$el.parentNode);
    },
    beforeUnmount() {
      this.parentResizeObserver.disconnect();
    },
    methods: {
      draw() {
        let ctx = this.canvas.getContext('2d');

        let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);
        
        let xScale = 1/100;
        let yScale = 1/100;
        let tScale = 1/100;

        for(let x = 0; x < this.canvas.width; x += this.scale) {
          for(let y = 0; y < this.canvas.height; y += this.scale) {
            let color = noise.get_fractal_noise_value([x * xScale, y * yScale, this.time * tScale]);
            let r, g, b;
            r = g = b = wasm.PerlinNoise.range_map(color, -1, 1, 0, 255);
            ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, this.scale, this.scale);
          }
        }
      },

      main() {
        this.noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);

        this.draw();
      },
    }
  }
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
