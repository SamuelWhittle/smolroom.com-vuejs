<template>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
    <div class="displayMessage ff-sans-cond uppercase text-white" :class="{'display-none': !initializing}">{{message}}</div>
    <div class="displayPerformance ff-sans-cond" :class="{'display-none': performanceDisplay}">{{performance}}</div>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
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
        drawingDisabled: true,
        performance: 0,
        message: "Initializing...",
      }
    },
    watch: {
        workersAtWork: {
            handler() {
                if (this.workersAtWork >= this.localConcurrency && this.initializing) {
                    //console.log("requested worker count reached during init");
                    this.initializing = false;
                    this.drawingDisabled = false;
                }
            }
        },
        initializing: {
            handler() {
                //console.log(this.initializing);
                if (!this.initializing) {
                    //console.log("finished init, starting watchers");
                    this.initWatchers();
                }
            }
        },
    },
    mounted() {
        // local concurrency state, saved once per init
        this.localConcurrency = null;

        // create empty variables used to store watchers
        this.seedWatcher = null;
        this.timeWatcher = null;
        this.scaleWatcher = null;
        this.smoothedWatcher = null;
        this.concurrencyWatcher = null;

        this.workers = null; // array of workers
        this.sab = null; // sharedArrayBuffer
        this.mu = null; // Mutex used to keep track of the lock state of the sharedArrayBuffer

        // get canvas from DOM
        this.canvas = document.getElementById('mainCanvas');
        // Set initial canvas rendering size
        this.canvas.width = this.$el.parentNode.clientWidth;
        this.canvas.height = this.$el.parentNode.clientHeight;

        this.offscreenCanvas = this.canvas.transferControlToOffscreen();

        //this.manager = null; // bg thread used to wait for all workers to be done then draw the noise
        // create the manager that keeps track of the waitgroup status
        this.manager = new Worker(new URL('../../assets/workers/PerlinNoiseManager.js', import.meta.url));
        this.manager.onmessage = (event) => {
            switch (event.data.msgType) {
            // manager says the group is done working, draw the imgData
            case 'finishedDrawing':
                this.performance = event.data.performance
                this.drawingDisabled = false;
                break;
            }
        };
            
        this.manager.postMessage({
            msgType: "canvas", 
            canvas: this.offscreenCanvas,
        }, [this.offscreenCanvas]);

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
            //console.log("init()");
            // If Init is called while the project is still Initializing, do nothing.
            if (!this.initializing) {
                //console.log("passed initializing check");
                // used to disallow other operations during initialization
                this.initializing = true;

                this.localConcurrency = this.concurrency;

                this.terminateAllWorkers();
                //console.log("All workers terminated");

                // Reset active worker count and other globals
                this.workersAtWork = 0;
                this.sab = null;
                this.mu = null;

                // create empty array to store workers
                this.workers = new Array(this.localConcurrency).fill();

                //console.log("variables reset");
                // Check if the browser supports web workers and is cross origin isolated
                if (window.Worker && crossOriginIsolated) {
                    //console.log("browser supported");
                    // start parallel initialization
                    this.initParallel();
                } else {
                    // if either of the above conditions are not true, do nothing.
                    //console.log("This browser does not support Web Workers and or SharedArrayBuffers");
                    this.message = "This browser does not support Web Workers and or SharedArrayBuffers"
                }
            } else {
                //console.log("Cannot run Init during a previous Init run.");
            }
        },
        //Initialize global parallel variables that do not change per-draw and create necessary workers
        initParallel() {
            //console.log("initParallel()");
            
            //create the Mutex needed to keep track of the sab state
            this.mu = new Mutex();

            //console.log("mutex created");
            for(let i = 0; i < this.workers.length; i++) {
                this.workers[i] = new Worker(new URL('../../assets/workers/PerlinNoiseWasmWorkerParallel.js', import.meta.url));
                this.workers[i].onmessage = (event) => {
                    switch (event.data.msgType) {
                        // when a worker is ready he clocks in
                        case 'clockIn':
                            this.workersAtWork ++;
                            break;
                    }
                };
                //console.log("worker hired");
            }
        },
        // terminate all existing workers including the manager, in the workers this calls `self.close()`
        terminateAllWorkers() {
            // tell every worker they are terminated
            if (this.workers){
                for (let i = 0; i < this.workers.length; i++) {
                    this.workers[i].postMessage({msgType: "terminate"});
                    //console.log("worker terminated");
                }
            }

            // tell the manager it is terminated
            /*if (this.manager) {
                this.manager.postMessage({msgType: "terminate"});
            }*/
        },
        // Initialize any necessary watchers
        initWatchers() {
            ////console.log("Initializing Watchers...");
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
                this.draw();
            })
            this.concurrencyWatcher = this.$watch('concurrency', () => {
                //console.log("CONCURRENCY WATCHER ACTIVATED");
                this.unwatch();
                this.init();
            })

            //
            this.parentResizeObserver = new ResizeObserver(() => {
                //this.canvas.width = this.$el.parentNode.clientWidth;
                //this.canvas.height = this.$el.parentNode.clientHeight;
                this.manager.postMessage({msgType: "resizeCanvas", width: this.$el.parentNode.clientWidth, height: this.$el.parentNode.clientHeight});

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
            // reset watcher variables
            this.seedWatcher = null;
            this.timeWatcher = null;
            this.scaleWatcher = null;
            this.smoothedWatcher = null;
            this.concurrencyWatcher = null;
        },
        draw() {
            //console.log("draw()");
            // if called while it's still drawing, don't
            if (!this.drawingDisabled && !this.initializing) {
                this.drawingDisabled = true;

                //this.currentScale = this.scale;

                this.noiseWidth = Math.ceil(this.canvas.width / this.scale);
                this.noiseHeight = Math.ceil(this.canvas.height / this.scale);

                this.sab = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 4 * 4);
                let wg = new WaitGroup(this.localConcurrency);

                this.manager.postMessage({
                    msgType: "startWaiting", 
                    swg:wg, 
                    sc:this.sab, 
                    scale: this.scale,
                    noiseWidth: this.noiseWidth,
                    noiseHeight: this.noiseHeight,
                    smoothed: this.smoothed,
                });
                
                for(let i = 0; i < this.workers.length; i ++) {
                    this.workers[i].postMessage({
                        msgType: "getNoise",
                        swg:wg, smu:this.mu, sc:this.sab,
                        groupTotal:this.localConcurrency, id:i,
                        numOctaves:this.numOctaves, octaveScale:this.octaveScale, seed:this.seed,
                        time:this.time,
                        width: this.noiseWidth, scale: this.scale,
                        xScale: this.xScale, yScale: this.yScale, tScale: this.tScale,
                    });
                }
            } else {
                //console.log("TRIED TO DRAW WHILE DRAWING DISABLED AND OR INITIALIZING");
            }
        },
    }
}
</script>
