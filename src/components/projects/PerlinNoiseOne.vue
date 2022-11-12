<template>
  <div class="fullscreen">
    <canvas id="mainCanvas" class="main-canvas"></canvas>
  </div>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>

<script>
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
      speed: {
        type: Number,
        default: 10,
      },
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');
      this.canvas.width = this.canvas.parentNode.clientWidth;
      this.canvas.height = this.canvas.parentNode.clientHeight;

      this.offscreenCanvas = this.canvas.transferControlToOffscreen();

      this.manager = new Worker('/public/workers/PerlinNoiseOneManager.js');

      this.manager.postMessage({
        msgType: "canvas", 
        canvas: this.offscreenCanvas,
      }, [this.offscreenCanvas]);

      this.parentResizeObserver = new ResizeObserver(() => {
        this.manager.postMessage({msgType: "resizeCanvas", width: this.canvas.parentNode.clientWidth, height: this.canvas.parentNode.clientHeight});
      });

      this.parentResizeObserver.observe(this.canvas.parentNode);
    },
    beforeUnmount() {
      this.parentResizeObserver.disconnect();
    },
  }
</script>
