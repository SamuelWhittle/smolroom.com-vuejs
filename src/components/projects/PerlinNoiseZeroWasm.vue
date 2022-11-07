<template>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
    <div class="displayPerformance" :class="{hidePerformance: performanceDisplay}">{{performance}}</div>
</template>

<script>
  import * as wasm from '@/assets/wasm/perlin_noise/perlin_noise_bg.js';

  export default {
    props: {
      seed: {
        type: Number,
        default: Math.floor(Math.random() * 1000),
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
      },
      performanceDisplay: {
          type: Boolean,
          default: false,
      },
    },
    data() {
      return {
        workerLoaded: false,
        drawing: false,
        performance: 0,
      }
    },
    watch: {
      workerLoaded: {
        handler() {
          this.workerCanvasInit().then(this.draw);
        }
      },
      /*drawing: {
        handler() {
          this.$emit('drawingToggle', this.drawing);
        }
      }*/
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');

      this.begin = null;

      this.initWorker().then(this.initWatchers);
    },
    beforeUnmount() {
      if (this.parentResizeObserver) {
        this.parentResizeObserver.disconnect();
      }
      if (this.noiseWorker) {
        this.noiseWorker.terminate();
      }
    },
    methods: {
      async initWorker() {
        if (window.Worker) {
          console.log("Main thread initializing worker...");
          this.noiseWorker = new Worker(new URL('../../assets/workers/PerlinNoiseWasmWorker.js', import.meta.url));

          this.noiseWorker.onmessage = (event) => {
            switch (event.data.msgType) {
              case 'loaded':
                this.workerLoaded = true;
                break;
              case 'drawingFinished':
                this.performance = performance.now() - this.begin;
                this.drawing = false;
                break;
              case 'error':
                console.log("error received from worker:", event);
                break;
              default:
                console.log("Main thread received unhandled msg type:", event);
            }
          };

          this.noiseWorker.onerror = (event) => {
            console.log(event);
          };
        } else {
          console.log("This browser does not support Web Workers, loading WASM on main thread.");
          this.canvasInit();
        }
      },
      async workerCanvasInit() {
        let offscreenCanvas = this.canvas.transferControlToOffscreen();
        offscreenCanvas.width = this.$el.parentNode.clientWidth;
        offscreenCanvas.height = this.$el.parentNode.clientHeight;

        this.noiseWorker.postMessage({msgType: "canvas", canvas: offscreenCanvas}, [offscreenCanvas]);

        this.parentResizeObserver = new ResizeObserver(() => {
          this.noiseWorker.postMessage({msgType: "resizeCanvas", width: this.$el.parentNode.clientWidth, height: this.$el.parentNode.clientHeight});

          this.draw();
        });

        this.parentResizeObserver.observe(this.$el.parentNode);
      },
      canvasInit() {
        this.parentResizeObserver = new ResizeObserver(() => {
          this.canvas.width = this.$el.parentNode.clientWidth;
          this.canvas.height = this.$el.parentNode.clientHeight;

          this.draw();
        });

        this.parentResizeObserver.observe(this.$el.parentNode);
      },
      initWatchers() {
        this.$watch('seed', () => {
          this.draw();
        })
        this.$watch('time', () => {
          this.draw();
        })
        this.$watch('scale', () => {
          this.draw();
        })
        this.$watch('smoothed', () => {
          this.draw();
        })
      },
      draw() {
        if (!this.drawing) {
          this.drawing = true;
          if (this.workerLoaded) {
            this.begin = performance.now();
            this.noiseWorker.postMessage({msgType: "drawNoiseArray", scale: this.scale, smoothed: this.smoothed, time: this.time, numOctaves: this.numOctaves, octaveScale: this.octaveScale, seed: this.seed});
          } else {
            this.begin = performance.now();

            if (this.smoothed) {
              this.drawSmoothed();
            } else {
              this.drawSquares();
            }

            this.performance = performance.now() - this.begin;
            this.drawing = false;
          }
        } else {
          //console.log("TRIED TO DRAW WHILE DRAWING");
        }
      },
      drawSmoothed() {
        let ctx = this.canvas.getContext('2d');

        let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, BigInt(this.seed));
        
        let xScale = 0.006;
        let yScale = 0.006;
        let tScale = 0.06;

        let imgData = new ImageData(Math.ceil(this.canvas.width / this.scale), Math.ceil(this.canvas.height / this.scale));

        imgData.data.set(
          Uint8ClampedArray.from(
            Array.from(noise.get_noise_array(
              new Array(Math.ceil(this.canvas.height / this.scale)).fill()
                .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
                .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale]))
            , 3))
              .map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255)))
              .flatMap((value) => [value, value, value, 255])
          )
        );

        /*let noisePositions = new Array(Math.ceil(this.canvas.height / this.scale)).fill()
          .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
          .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale]));
        
        imgData.data.set(
          Uint8ClampedArray.from(
            Array.from(noise.get_noise_img_data(noisePositions, 3))
              .map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255)))
              .flatMap((value) => [value, value, value, 255])
          )
        );*/

        createImageBitmap(imgData).then((bitMap) => {
          ctx.drawImage(bitMap, 0, 0, imgData.width * this.scale, imgData.height * this.scale);
        });

      },
      drawSquares() {
        let ctx = this.canvas.getContext('2d');

        let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, BigInt(this.seed));
        
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
    }
  }
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
