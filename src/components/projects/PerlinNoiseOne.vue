<template>
  <div class="fullscreen">
    <canvas id="mainCanvas" class="main-canvas"></canvas>
  </div>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
  import { Mutex, WaitGroup } from 'pub/classes/ParallelSync.mjs';

  export default {
    props: {
      canvasDivisor: {
        type: Number,
        default: 40,
      },
      fps: {
        type: Number,
        default: 24,
      },
      /*speed: {
        type: Number,
        default: 10,
      },*/
    },
    data() {
      return {
        initializing: false,
        workersAtWork: 0,
        drawingDisabled: true,
        message: "Initializing...",
      }
    },
    watch: {
        workersAtWork: {
            handler() {
                if (this.workersAtWork >= 3 && this.initializing) {
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
      this.workers = null;
      
      this.angleMu = null;
      this.colorMu = null;
      this.intensityMu = null;

      this.angleSab = null;
      this.colorSab = null;
      this.intensitySab = null;
      
      this.canvas = document.getElementById('mainCanvas');
      this.canvas.width = this.canvas.parentNode.clientWidth;
      this.canvas.height = this.canvas.parentNode.clientHeight;

      this.offscreenCanvas = this.canvas.transferControlToOffscreen();

      this.manager = new Worker('/workers/PerlinNoiseOneManager.js');
      this.manager.onmessage = (event) => {
        switch (event.data.msgType) {
          // manager says the group is done working, draw the imgData
          case 'finishedDrawing':
            //this.performance = event.data.performance
            this.drawingDisabled = false;
            break;
        }
      };

      this.manager.postMessage({
        msgType: "canvas", 
        canvas: this.offscreenCanvas,
      }, [this.offscreenCanvas]);

      this.init();
    },
    beforeUnmount() {
      this.parentResizeObserver.disconnect();
      
      this.manager.postMessage({ msgType: "terminate" });
    },
    methods: {
      init() {
        //console.log("init()");
        // If Init is called while the project is still Initializing, do nothing.
        if (!this.initializing) {
          //console.log("passed initializing check");
          // used to disallow other operations during initialization
          this.initializing = true;

          this.terminateAllWorkers();
          //console.log("All workers terminated");

          // Reset active worker count and other globals
          this.workersAtWork = 0;
          this.workers = new Array(3);

          this.angleMu = null;
          this.colorMu = null;
          this.intensityMu = null;

          this.angleSab = null;
          this.colorSab = null;
          this.intensitySab = null;

          // create empty array to store workers
          this.workers = new Array(3).fill();

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
      initParallel() {
        //console.log("initParallel()");
            
        //create the Mutex needed to keep track of the sab state
        this.angleMu = new Mutex();
        this.colorMu = new Mutex();
        this.intensityMu = new Mutex();

        //console.log("mutex created");
        for(let i = 0; i < this.workers.length; i++) {
          //this.workers[i] = new Worker(new URL('../../assets/workers/PerlinNoiseZeroWasmWorker.js', import.meta.url));
          this.workers[i] = new Worker('/workers/PerlinNoiseOneWorker.js');
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
      initWatchers() {
        console.log("Initializing Watchers...");
        /*this.seedWatcher = this.$watch('seed', () => {
          this.draw();
        })*/

        this.parentResizeObserver = new ResizeObserver(() => {
          this.manager.postMessage({msgType: "resizeCanvas", width: this.canvas.parentNode.clientWidth, height: this.canvas.parentNode.clientHeight});
        });

        this.parentResizeObserver.observe(this.canvas.parentNode);
      },
      unwatch() {
        //this.seedWatcher();
        //this.seedWatcher = null;
        
        if (this.parentResizeObserver) {
          this.parentResizeObserver.disconnect();
        }
      },
      terminateAllWorkers() {
        // tell every worker they are terminated
        if (this.workers){
          for (let i = 0; i < this.workers.length; i++) {
            this.workers[i].postMessage({msgType: "terminate"});
            //console.log("worker terminated");
          }
        }
      },
    }
  }
</script>
