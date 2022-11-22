<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
  export default {
    props: {
      canvasDivisor: {
        type: Number,
        default: 30,
      },
      numOctaves: {
        type: Number,
        default: 1,
      },
      octaveScale: {
        type: Number,
        default: 3/4,
      }
    },
    data() {
      return {
        initializing: false,
        message: "Initializing...",
      }
    },
    watch: {
        initializing: {
            handler() {
                //console.log(this.initializing);
                if (!this.initializing) {
                    this.initWatchers();
                }
            }
        },
    },
    mounted() {
      this.manager = null;
      
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
    },
    methods: {
      init() {
        // If Init is called while the project is still Initializing, do nothing.
        if (!this.initializing) {
          // used to disallow other operations during initialization
          this.initializing = true;
          
          this.terminateManager();

          this.manager = new Worker('/workers/PerlinNoiseOneManager.js');
          this.manager.onmessage = (event) => {
            switch (event.data.msgType) {
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

        } else {
          console.error("Cannot Init during Init");
        }
      },
      initWatchers() {
        this.parentResizeObserver = new ResizeObserver(() => {
          this.manager.postMessage({msgType: "resizeCanvas", width: this.canvas.parentNode.clientWidth, height: this.canvas.parentNode.clientHeight});
        });

        this.parentResizeObserver.observe(this.canvas.parentNode);
      },
      unwatch() {
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
          }
        }
      },
    }
  }
</script>
