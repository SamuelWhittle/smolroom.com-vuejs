<script setup>
  import { Triangle } from '@/assets/classes/Triangle';
</script>

<script>
  export default {
    props: {
      triangle: {
        type: Triangle,
        required: true,
      },
    },
    data() {
      return {
        width: null,
        height: null
      }
    },
    computed: {
      getCoords() {
        return this.triangle.coords;
      },
    },
    watch: {
      getCoords: {
        handler() {
          this.redrawCanvas();
        },
        deep: true,
      },
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.redrawCanvas();
      
      this.parentResizeObserver = new ResizeObserver(() => {
        this.canvas.width = this.$parent.$el.clientWidth;
        this.canvas.height = this.$parent.$el.clientHeight;

        this.redrawCanvas();
      });

      this.parentResizeObserver.observe(this.$parent.$el);
    },
    methods: {
      redrawCanvas() {
        // Make sure canvas resolution matches window inner resolution
        this.ctx.fillStyle = '#16161d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the thing
        this.triangle.drawCircumcenter(this.canvas.width, this.canvas.height, this.ctx);
      }
    },
    beforeDestroy() {
      this.parentResizeObserver.disconnect();
    },
  }
</script>

<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
