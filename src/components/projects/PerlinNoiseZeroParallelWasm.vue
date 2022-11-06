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
        workersAtWork: 0,
        workersReady: false,
        drawing: false
      }
    },
    watch: {
        workersAtWork: {
            handler() {
                if (this.workersAtWork >= this.concurrency) {
                    //console.log("All Workers have clocked in...");
                    this.workersReady = true;
                }
            }
        },
        workersReady: {
            handler() {
                if (this.workersReady) {
                    this.initWatchers();
                }
            }
        }
    },
    mounted() {
        this.canvas = document.getElementById('mainCanvas');
        this.canvas.width = this.$el.parentNode.clientWidth;
        this.canvas.height = this.$el.parentNode.clientHeight;

        this.begin = null;

        this.waiter = null;
        this.workers = [];
        this.sab = null;
        this.mu = null;
        this.wg = null;

        this.xScale = 0.006;
        this.yScale = 0.006;
        this.tScale = 0.06;

        if (window.Worker) {
            this.initParallel();
        } else {
            //console.log("This browser does not support Web Workers, using WASM on main thread.");
        }

        //this.initWatchers();
    },
    beforeUnmount() {
        if (this.parentResizeObserver) {
            this.parentResizeObserver.disconnect();
        }
        if (this.waiter) {
            this.waiter.terminate();
        }
    },
    methods: {
        initParallel() {
            //console.log("Main thread initializing workers...");
            
            this.mu = new Mutex();
            //this.wg = new WaitGroup(this.concurrency);

            this.waiter = new Worker(new URL('../../assets/workers/WaiterWorker.js', import.meta.url));
            this.waiter.onmessage = (event) => {
                switch (event.data.msgType) {
                case 'noiseReady':
                    this.drawNoise();
                    break;
                default:
                    //console.log("Main thread received unhandled msg type:", event);
                }
            };
            this.waiter.onerror = (event) => {
                //console.log(event);
            };

            for(let i = 0; i < this.concurrency; i++) {
                //this.workers.push(new Worker('/workers/PerlinNoiseWasmWorkerParallel.js'));
                this.workers.push(new Worker(new URL('../../assets/workers/PerlinNoiseWasmWorkerParallel.js', import.meta.url)));
                this.workers[i].onmessage = (event) => {
                    switch (event.data.msgType) {
                        case 'clockIn':
                            this.workersAtWork ++;
                            break;
                        default:
                            //console.log("Main thread received unhandled msg type:", event);
                    }
                };
            }
        },
        initWatchers() {
            //console.log("Initializing Watchers...");
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

            this.parentResizeObserver = new ResizeObserver(() => {
                this.canvas.width = this.$el.parentNode.clientWidth;
                this.canvas.height = this.$el.parentNode.clientHeight;

                this.draw();
            });

            this.parentResizeObserver.observe(this.$el.parentNode);
        },
        draw() {
            //console.log("draw()");
            if (!this.drawing) {
                this.drawing = true;
                if (this.workersReady && crossOriginIsolated) {
                    this.begin = performance.now();
                    //this.wg.add(this.concurrency);
                    this.currentScale = this.scale;
                    this.noiseWidth = Math.ceil(this.canvas.width / this.currentScale);
                    this.noiseHeight = Math.ceil(this.canvas.height / this.currentScale);
                    this.sab = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 4 * 4);
                    this.wg = new WaitGroup(this.concurrency);

                    this.waiter.postMessage({swg:this.wg, sc:this.sab});
                    
                    for(let i = 0; i < this.workers.length; i ++) {
                        this.workers[i].postMessage({
                            swg:this.wg, smu:this.mu, sc:this.sab,
                            groupTotal:this.concurrency, id:i,
                            numOctaves:this.numOctaves, octaveScale:this.octaveScale, seed:this.seed,
                            time:this.time,
                            width: this.noiseWidth, scale: this.currentScale,
                            xScale: this.xScale, yScale: this.yScale, tScale: this.tScale,
                        });
                    }
                } else {
                    this.begin = performance.now();

                    this.drawSmoothed();

                    //console.log(performance.now() - this.begin);
                    this.drawing = false;
                }
            } else {
                //console.log("TRIED TO DRAW WHILE DRAWING");
            }
        },
        drawNoise() {
            let ctx = this.canvas.getContext('2d');
            ctx.imageSmoothingEnabled = this.smoothed;
            ctx.imageSmoothingQuality = "high";
            //const noise = new Int32Array(this.sab);

            this.mu.lock();

            let imgData = new ImageData(this.noiseWidth, this.noiseHeight);

            imgData.data.set(Uint8ClampedArray.from(new Int32Array(this.sab)));

            this.mu.unlock();

            createImageBitmap(imgData, {resizeQuality: "pixelated"}).then((bitMap) => {
                ctx.drawImage(bitMap, 0, 0, imgData.width * this.currentScale, imgData.height * this.currentScale);
            });

            //console.log(performance.now() - this.begin);
            this.drawing = false;
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
                        .flatMap((value) => [value, value, value, 255])
                )
            );

            createImageBitmap(imgData).then((bitMap) => {
                ctx.drawImage(bitMap, 0, 0, imgData.width * this.scale, imgData.height * this.scale);
            });

        },
    }
}
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
