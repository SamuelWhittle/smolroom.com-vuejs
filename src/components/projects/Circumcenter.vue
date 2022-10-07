<script setup>
  import { Triangle } from '@/assets/classes/Triangle';
</script>

<script>
  export default {
    props: {
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      coordsArray: {
        type: Array,
        required: true,
      },
    },
    watch: {
      width: {
        handler() {
          this.adjustCanvasResolution();
          this.redrawCanvas();
        }
      },
      height: {
        handler() {
          this.adjustCanvasResolution();
          this.redrawCanvas();
        }
      },
      coordsArray: {
        handler() {
          this.redrawCanvas();
        },
        deep: true,
      },
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.triangle = new Triangle(this.coordsArray[0], this.coordsArray[1], this.coordsArray[2]);

      this.adjustCanvasResolution();
      this.redrawCanvas();
    },
    methods: {
      adjustCanvasResolution() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      },
      redrawCanvas() {
        this.triangle.update(this.coordsArray[0], this.coordsArray[1], this.coordsArray[2]);

        // Make sure canvas resolution matches window inner resolution
        this.ctx.fillStyle = '#16161d';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw the thing
        this.triangle.drawCircumcenter(this.width, this.height, this.ctx);
      }
    },
  }
</script>

<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
