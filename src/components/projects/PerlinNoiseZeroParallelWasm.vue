<template>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
    <div class="displayPerformance" :class="{hidePerformance: performanceDisplay}">{{performance}}</div>
</template>

<script>
import * as wasm from '@/assets/wasm/perlin_noise/perlin_noise_bg.js';
//import { Mutex, WaitGroup } from '@/assets/classes/ParallelSync.js';

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
        },
        performanceDisplay: {
            type: Boolean,
            default: false,
        },
        xScale: {
            type: Number,
            default: 0.006,
        },
        yScale: {
            type: Number,
            default: 0.006,
        },
        tScale: {
            type: Number,
            default: 0.06,
        },
    },
    data() {
      return {
        initializing: false,
        workersAtWork: 0,
        drawing: false,
        performance: 0,
      }
    },
    watch: {
        workersAtWork: {
            handler() {
                if (this.workersAtWork >= this.concurrency) {
                    this.initializing = false;
                }
            }
        },
        initializing: {
            handler() {
                if (!this.initializing) {
                    this.initWatchers();
                }
            }
        },
    },
    mounted() {
        // create empty variables used to store watchers
        this.seedWatcher = null;
        this.timeWatcher = null;
        this.scaleWatcher = null;
        this.smoothedWatcher = null;
        this.concurrencyWatcher = null;

        // get canvas from DOM
        this.canvas = document.getElementById('mainCanvas');
        // Set initial canvas rendering size
        this.canvas.width = this.$el.parentNode.clientWidth;
        this.canvas.height = this.$el.parentNode.clientHeight;

        this.imgData = null; // imgData that noise will be put into and drawn later

        this.begin = null; // used to store time when draing starts for performance reference

        this.manager = null; // bg thread used to wait for all workers to report being done
        this.workers = []; // array of workers
        this.sab = null; // sharedArrayBuffer
        this.mu = null; // Mutex used to keep track of the lock state of the sharedArrayBuffer

        this.init(); // Init project
    },
    beforeUnmount() {
        if (this.parentResizeObserver) {
            this.parentResizeObserver.disconnect();
        }
        this.terminateAllWorkers();
    },
    methods: {
        // Initialize all project variables and check for project browser support, start project
        init() {
            // If Init is called while the project is still Initializing, do nothing.
            if (!this.initializing) {
                this.initializing = true;
                // initialize global performance variable
                this.begin = null;

                // Reset active worker count
                this.workersAtWork = 0;

                // Initialize global parallel variables
                this.workers = new Array().fill();

                // Check if the browser supports web workers and is cross origin isolated
                if (window.Worker && crossOriginIsolated) {
                    // start parallel initialization
                    this.initParallel();
                } else {
                    // if either of the above conditions are not true, run wasm module in main thread
                    console.log("This browser does not support Web Workers, using WASM on main thread.");
                    //this.initWatchers();
                }
            } else {
                console.log("Cannot run Init during a previous Init run.");
            }
        },
        //Initialize global parallel variables that do not change per-draw and create necessary workers
        initParallel() {
            //console.log("Main thread initializing workers...");
            
            //create the Mutex needed to keep track of the sab state
            this.mu = new Mutex();

            // create the manager that keeps track of the waitgroup status
            this.manager = new Worker(new URL('../../assets/workers/WaiterWorker.js', import.meta.url));
            this.manager.onmessage = (event) => {
                switch (event.data.msgType) {
                // manager says the group is done working, draw the imgData
                case 'noiseReady':
                    this.drawImgData();

                    this.performance = performance.now() - this.begin;
                    this.drawing = false;
                    break;
                }
            };

            for(let i = 0; i < this.concurrency; i++) {
                //this.workers.push(new Worker('/workers/PerlinNoiseWasmWorkerParallel.js'));
                this.workers.push(new Worker(new URL('../../assets/workers/PerlinNoiseWasmWorkerParallel.js', import.meta.url)));
                this.workers[i].onmessage = (event) => {
                    switch (event.data.msgType) {
                        // when a worker is ready he clocks in
                        case 'clockIn':
                            this.workersAtWork ++;
                            break;
                    }
                };
            }
        },
        // terminate all existing workers including the manager, in the workers this calls `self.close()`
        terminateAllWorkers() {
            // tell every worker they are terminated
            if (this.workers.length > 0){
                for (let i = 0; i < this.workers.length; i++) {
                    this.workers[i].postMessage({msgType: "terminate"});
                }
            }

            // tell the manager it is terminated
            if (this.manager) {
                this.manager.postMessage({msgType: "terminate"});
            }
        },
        // Initialize any necessary watchers
        initWatchers() {
            //console.log("Initializing Watchers...");
            this.seedWatcher = this.$watch('seed', () => {
                this.draw();
            })
            this.timeWatcher = this.$watch('time', () => {
                this.draw();
            })
            this.scaleWatcher = this.$watch('scale', () => {
                this.draw();
            })
            this.smoothedWatcher = this.$watch('smoothed', () => {
                //this.draw();
                this.drawImgData();
            })
            this.concurrencyWatcher = this.$watch('concurrency', () => {
                this.unwatch();
                this.terminateAllWorkers();
                this.init();
            })

            //
            this.parentResizeObserver = new ResizeObserver(() => {
                this.canvas.width = this.$el.parentNode.clientWidth;
                this.canvas.height = this.$el.parentNode.clientHeight;

                this.draw();
            });

            this.parentResizeObserver.observe(this.$el.parentNode);
        },
        unwatch() {
            this.seedWatcher();
            this.timeWatcher();
            this.scaleWatcher();
            this.smoothedWatcher();
            this.concurrencyWatcher();
        },
        draw() {
            //console.log("draw()");
            // if called while it's still drawing, don't
            if (!this.drawing) {
                this.drawing = true;
                // if it is not done 
                if (!this.initializing && window.Worker && crossOriginIsolated) {
                    this.begin = performance.now();

                    this.currentScale = this.scale;
                    this.noiseWidth = Math.ceil(this.canvas.width / this.currentScale);
                    this.noiseHeight = Math.ceil(this.canvas.height / this.currentScale);
                    this.sab = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 4 * 4);
                    let wg = new WaitGroup(this.concurrency);

                    this.manager.postMessage({msgType: "startWaiting", swg:wg, sc:this.sab});
                    
                    for(let i = 0; i < this.workers.length; i ++) {
                        this.workers[i].postMessage({
                            msgType: "getNoise",
                            swg:wg, smu:this.mu, sc:this.sab,
                            groupTotal:this.concurrency, id:i,
                            numOctaves:this.numOctaves, octaveScale:this.octaveScale, seed:this.seed,
                            time:this.time,
                            width: this.noiseWidth, scale: this.currentScale,
                            xScale: this.xScale, yScale: this.yScale, tScale: this.tScale,
                        });
                    }
                }/* else if (!window.Worker) {
                    console.log("DRAWING ON MAIN THREAD");
                    this.begin = performance.now();

                    this.drawMainThread();

                    this.performance = performance.now() - this.begin;
                    this.drawing = false;
                }*/
            } else {
                //console.log("TRIED TO DRAW WHILE DRAWING");
            }
        },
        fillImgData() {
            this.mu.lock();

            this.imgData = new ImageData(this.noiseWidth, this.noiseHeight);

            this.imgData.data.set(Uint8ClampedArray.from(new Int32Array(this.sab)));

            this.mu.unlock();
        },
        drawImgData() {
            // grab canvas context and set smoothed value
            let ctx = this.canvas.getContext('2d');
            ctx.imageSmoothingEnabled = this.smoothed;

            this.fillImgData();

            createImageBitmap(this.imgData, {resizeQuality: "pixelated"}).then((bitMap) => {
                ctx.drawImage(bitMap, 0, 0, this.imgData.width * this.currentScale, this.imgData.height * this.currentScale);
            });
        },
        drawMainThread() {
            let ctx = this.canvas.getContext('2d');

            let noise = wasm.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, BigInt(this.seed));

            let xScale = 0.006;
            let yScale = 0.006;
            let tScale = 0.06;

            this.imgData = new ImageData(Math.ceil(this.canvas.width / this.scale), Math.ceil(this.canvas.height / this.scale));

            this.imgData.data.set(
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

            createImageBitmap(this.imgData).then((bitMap) => {
                ctx.drawImage(bitMap, 0, 0, this.imgData.width * this.scale, this.imgData.height * this.scale);
            });

        },
    }
}
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
