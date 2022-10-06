<template>
  <canvas id="BgCanvas" class="bg-canvas"
    @mousemove="mousemoveHandle"></canvas>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      lastX: 0,
      lastY: 0,
    }
  },

  mounted() {
    this.canvas = document.getElementById('BgCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.restartBackground();

    window.addEventListener('resize', () => {
      this.restartBackground();
    });

    window.addEventListener('mousemove', (e) => {
      this.mousemoveHandle(e)
    })
  },

  methods: {
    mousemoveHandle(e) {
      if (!(this.lastX == 0 && this.lastY == 0)) {
        // Draw Line from saved to current coords
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#202030';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.clientX, e.clientY);
        this.ctx.stroke();
        this.ctx.closePath();
      }

      // Set saved coords to current coords
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    },
    restartBackground() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.ctx.fillStyle = '#16161d';
      this.ctx.beginPath();
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.stroke();
      this.ctx.closePath();

      this.lastX = 0;
      this.lastY = 0;
    },
  }
}
</script>

<style scoped src='@/assets/css/components/bg-canvas.css'></style>
