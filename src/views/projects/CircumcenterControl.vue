<script setup>
  import Circumcenter from '@/components/projects/Circumcenter.vue';
</script>

<script>
  export default {
    data() {
      return {
        displayWidth: null,
        displayHeight: null,
        triangle: new Array(3).fill(new Array(2).fill(0)),
      }
    },
    mounted() {
      this.resize();

      this.triangle[0] = [this.getRandomInt(this.displayWidth - 10),this.getRandomInt(this.displayHeight - 10)];
      this.triangle[1] = [this.getRandomInt(this.displayWidth - 10),this.getRandomInt(this.displayHeight - 10)];
      this.triangle[2] = [this.getRandomInt(this.displayWidth - 10),this.getRandomInt(this.displayHeight - 10)];

      window.addEventListener('resize', () => {
        this.resize();
      });

      window.addEventListener('mousedown', () => {
        this.mousedownHandle();
      });

      window.addEventListener('mousemove', () => {
        this.mousemoveHandle();
      });

      window.addEventListener('mouseup', () => {
        this.mouseupHandle();
      });

      window.addEventListener('touchstart', () => {
        this.touchstartHandle();
      });

      window.addEventListener('touchmove', () => {
        this.touchmoveHandle();
      });

      window.addEventListener('touchend', () => {
        this.touchendHandle();
      });
    },
    methods: {
      resize() {
        this.displayWidth = this.$refs.canvasContainer.clientWidth;
        this.displayHeight = this.$refs.canvasContainer.clientHeight;
      },
      getRandomInt(max) {
        return Math.floor(Math.random() * max);
      },
      mousedownHandle() {},
      mousemoveHandle() {},
      mouseupHandle() {},
      touchstartHandle() {},
      touchmoveHandle() {},
      touchendHandle() {},
    },
    components: {
      Circumcenter,
    },
  }
</script>

<template>
  <div class="canvas-container" ref="canvasContainer">
    <Circumcenter :coords-array="triangle" :width="Number(displayWidth)" :height="Number(displayHeight)"/>
  </div>
</template>

<style scoped src="@/assets/css/views/circumcenter-control.css"></style>
