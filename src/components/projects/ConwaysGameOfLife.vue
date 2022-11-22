<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
  export default {
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
      this.canvas = document.getElementById('mainCanvas');
      this.canvas.width = this.canvas.parentNode.clientWidth;
      this.canvas.height = this.canvas.parentNode.clientHeight;

      this.offscreenCanvas = this.canvas.transferControlToOffscreen();

      this.init();
    },
    methods: {
      init() {
        if (this.initializing) return;
        
        this.initializing = true;

        this.terminateManager();

        this.manager = new Worker('/workers/ConwaysGameOfLifeManager.js');
        this.manager.onmessage = (event) => {
          switch (event.data.msgType) {
            case 'clockIn':
              this.manager.postMessage({
                msgType: "task", 
                canvas: this.offscreenCanvas,
                canvasDivisor: this.canvasDivisor,
              }, [this.offscreenCanvas]);

              this.initializing = false;
              break;
          }
        };
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
    }
  }
</script>
