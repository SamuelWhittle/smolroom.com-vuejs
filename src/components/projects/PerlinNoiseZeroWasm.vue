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
        default: 0.75,
      },
      time: {
        type: Number,
        required: true,
      },
      scale: {
        type: Number,
        required: true,
      },
      smoothed: {
        type: Boolean,
        default: false
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
      smoothed: {
        handler() {
          this.draw();
        }
      }
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
      drawSmoothed() {
        let ctx = this.canvas.getContext('2d');

        let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);
        
        let xScale = 0.006;
        let yScale = 0.006;
        let tScale = 0.06;

        let noisePositions = new Array(Math.ceil(this.canvas.height / this.scale)).fill()
          .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
          .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale]));

        //let noiseValues = Array.from(noise.get_noise_img_data(noisePositions, 3));

        //let noiseImgData = noiseValues.map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255))).flatMap((value) => [value, value, value, 255]);

        let noiseImgData = Array.from(noise.get_noise_img_data(noisePositions, 3))
          .map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255)))
          .flatMap((value) => [value, value, value, 255]);

        let imgData = new ImageData(Math.ceil(this.canvas.width / this.scale), Math.ceil(this.canvas.height / this.scale));
        imgData.data.set(Uint8ClampedArray.from(noiseImgData));

        createImageBitmap(imgData).then((bitMap) => {
          ctx.drawImage(bitMap, 0, 0, imgData.width * this.scale, imgData.height * this.scale);
        });

      },
      drawSquares() {
        let ctx = this.canvas.getContext('2d');

        let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);
        
        let xScale = 0.006;
        let yScale = 0.006;
        let tScale = 0.06;

        for(let x = 0; x < this.canvas.width; x += this.scale) {
          for(let y = 0; y < this.canvas.height; y += this.scale) {
            let color = noise.get_fractal_noise_value([x * xScale, y * yScale, this.time * tScale]);
            let r, g, b;
            r = g = b = wasm.PerlinNoise.range_map(color, -0.8, 0.8, 0, 255);
            ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, this.scale, this.scale);
          }
        }
        
      },
      draw() {
        let begin = performance.now();
        if (this.smoothed) { 
          this.drawSmoothed();
        } else {
          this.drawSquares();
        }
        console.log(performance.now() - begin);
      },
      main() {
        this.noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);

        this.draw();
      },
    }
  }
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
