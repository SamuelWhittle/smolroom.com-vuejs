<template>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
</template>

<script>
import * as wasm from '@/assets/wasm/perlin_noise/perlin_noise_bg.js';
import { Mutex, WaitGroup } from '@/assets/classes/ParallelSync.js';

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
        concurrency: {
            type: Number,
            required: true,
        }
    },
    data() {
      return {
        workerLoaded: false,
        drawing: false
      }
    },
    watch: {
      /*workerLoaded: {
        handler() {
          this.workerCanvasInit().then(this.draw);
        }
      },*/
      /*drawing: {
        handler() {
          this.$emit('drawingToggle', this.drawing);
        }
      }*/
    },
    mounted() {
        this.canvas = document.getElementById('mainCanvas');
        this.parentResizeObserver = new ResizeObserver(() => {
            this.canvas.width = this.$el.parentNode.clientWidth;
            this.canvas.height = this.$el.parentNode.clientHeight;

            this.draw();
        });

        this.parentResizeObserver.observe(this.$el.parentNode);

        this.waiter = new Worker('/workers/WaiterWorker.js');
        this.workers = [];
        this.sab = new SharedArrayBuffer(1024);
        this.mu = new Mutex();
        this.wg = new WaitGroup(this.concurrency);

        if (window.Worker) {
            console.log("Main thread initializing workers...");

            for(let i = 0; i < this.concurrency; i++) {
                this.workers.push(new Worker('/workers/PerlinNoiseWasmWorkerParallel.js'));
            }

            this.waiter.postMessage({swg:this.wg, sc:this.sab});

            this.workerLoaded = true;
        } else {
            console.log("This browser does not support Web Workers, using WASM on main thread.");
        }

        //this.initWatchers();

        //this.initWorker().then(this.initWatchers);
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
                    for(let i = 0; i < this.workers.length; i ++) {
                        this.workers[i].postMessage({swg:this.wg, smu:this.mu, sc:this.sab, id:i});
                    }
                } else {
                    let begin = performance.now();

                    if (this.smoothed) {
                        this.drawSmoothed();
                    } else {
                        this.drawSquares();
                    }

                    console.log(performance.now() - begin);
                    this.drawing = false;
                }
            } else {
                console.log("TRIED TO DRAW WHILE DRAWING");
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
                    Array.from(
                        noise.get_noise_array(
                            new Array(Math.ceil(this.canvas.height / this.scale)).fill()
                                .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
                                .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale])), 3
                        )
                    ).map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255)))
                        .flatMap((value) => [value, value, value, 255])));

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
