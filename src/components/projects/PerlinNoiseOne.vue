<template>
  <div class="fullscreen">
    <canvas id="mainCanvas" class="main-canvas"></canvas>
  </div>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
  //import { WaitGroup } from 'pub/classes/ParallelSync.mjs';

  export default {
    props: {
      canvasDivisor: {
        type: Number,
        default: 30,
      },
      fps: {
        type: Number,
        default: 24,
      },
      numOctaves: {
        type: Number,
        default: 1,
      },
      octaveScale: {
        type: Number,
        default: 3/4,
      }
      /*speed: {
        type: Number,
        default: 10,
      },*/
    },
    data() {
      return {
        initializing: false,
        //workersAtWork: 0,
        //drawingDisabled: true,
        message: "Initializing...",
        //time: 0,
      }
    },
    watch: {
        /*workersAtWork: {
            handler() {
                if (this.workersAtWork >= 3 && this.initializing) {
                    //console.log("requested worker count reached during init");
                    this.initializing = false;
                    this.drawingDisabled = false;
                }
            }
        },*/
        initializing: {
            handler() {
                //console.log(this.initializing);
                if (!this.initializing) {
                    console.log("finished init, starting watchers");
                    this.initWatchers();
                    //this.setDrawInterval();
                    //this.draw();
                }
            }
        },
    },
    mounted() {
      this.manager = null;
      //this.workers = null;
      
      //this.sabs = null;

      //this.seeds = null;

      //this.drawInterval = null;
      
      this.canvas = document.getElementById('mainCanvas');
      this.canvas.width = this.canvas.parentNode.clientWidth;
      this.canvas.height = this.canvas.parentNode.clientHeight;

      this.offscreenCanvas = this.canvas.transferControlToOffscreen();

      this.xScale = 0.002;
      this.yScale = 0.002;
      this.tScale = 0.003;

      this.init();
    },
    beforeUnmount() {
      this.unwatch();
      
      this.terminateManager();
      //this.terminateAllWorkers();

      //this.clearDrawInterval();
    },
    methods: {
      init() {
        // If Init is called while the project is still Initializing, do nothing.
        if (!this.initializing) {
          // used to disallow other operations during initialization
          this.initializing = true;
          
          this.terminateManager();
          //this.terminateAllWorkers();
          //console.log("All workers terminated");

          this.manager = new Worker('/workers/PerlinNoiseOneManager.js');
          this.manager.onmessage = (event) => {
            switch (event.data.msgType) {
              // manager says the group is done working, draw the imgData
              /*case 'finishedDrawing':
                //this.performance = event.data.performance
                this.drawingDisabled = false;
                this.time++
                break;*/
              case 'clockIn':
                this.manager.postMessage({
                  msgType: "task", 
                  canvas: this.offscreenCanvas,
                  canvasDivisor: this.canvasDivisor,
                  numOctaves: this.numOctaves,
                  octaveScale: this.octaveScale,
                  xScale: this.xScale, yScale: this.yScale, tScale: this.tScale,
                }, [this.offscreenCanvas]);

                this.initializing = false;
                break;
            }
          };

          // Reset active worker count and other globals
          //this.workersAtWork = 0;
          //this.workers = new Array(3).fill();
          //this.time = 0;
          //this.sabs = new Array(3);

          //this.seeds = new Array(3).fill(Math.floor(Math.random() * 1000));
          
          // Check if the browser supports web workers and is cross origin isolated
          /*if (window.Worker && crossOriginIsolated) {
            // start parallel initialization
            this.initParallel();
          } else {
            // if either of the above conditions are not true, do nothing.
            this.message = "This browser does not support Web Workers and or SharedArrayBuffers"
          }*/
        } else {
          console.error("Cannot Init during Init");
        }
      },
      /*initParallel() {
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
        }
      },*/
      initWatchers() {
        //console.log("Initializing Watchers...");
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
      terminateManager() {
        if (this.manager) {
          this.manager.postMessage({ msgType: "terminate" });
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
      /*setDrawInterval() {
        this.clearDrawInterval();
        this.drawInterval = setInterval(this.draw, 1000/this.fps);
      },
      clearDrawInterval() {
        if (this.drawInterval) {
          clearInterval(this.drawInterval);
        }
      },*/
      draw() {
        if (!this.drawingDisabled && !this.initializing) {
          this.drawingDisabled = true;

          //this.noiseWidth = Math.ceil(this.canvas.width / this.canvasDivisor) + 3;
          //this.noiseHeight = Math.ceil(this.canvas.height / this.canvasDivisor) + 3;
          
          //this.sabs = new Array(3);
          //this.sabs[0] = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 8);
          //this.sabs[1] = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 8);
          //this.sabs[2] = new SharedArrayBuffer(this.noiseWidth * this.noiseHeight * 8);
          //let wg = new WaitGroup(3);
          
          /*this.manager.postMessage({
            msgType: "startWaiting", 
            swg:wg, 
            sabs: this.sabs, 
            canvasDivisor: this.canvasDivisor,
            noiseWidth: this.noiseWidth, noiseHeight: this.noiseHeight,
          });*/
          
          for(let i = 0; i < this.workers.length; i ++) {
            this.workers[i].postMessage({
              msgType: "getNoiseArray",
              swg:wg, sab:this.sabs[i],
              numOctaves:this.numOctaves, octaveScale:this.octaveScale, seed: this.seeds[i],
              time:this.time,
              noiseWidth: this.noiseWidth, canvasDivisor: this.canvasDivisor,
              xScale: this.xScale, yScale: this.yScale, tScale: this.tScale,
            });
          }
        } else {
          console.warn("drawing is disabled while drawing");
        }
      }
    }
  }
</script>
