<script setup>
  import { Color } from '@/assets/classes/Color';
  import { DesaturationScale } from '@/assets/classes/DesaturationScale';
</script>

<script>
  export default {
    props: {
      gridWidth: {
        type: Number,
        default: 13,
      },
      gridHeight: {
        type: Number,
        default: 23,
      },
      gridThickness: {
        type: Number,
        default: 20,
      },
      startColor: {
        type: Color,
        default: new Color(255, 128, 0),
      }
    },
    watch: {
      startColor:{
        handler(newVal) {
          this.drawScale(new DesaturationScale(newVal, this.gridWidth, this.gridHeight));
        },
        deep: true
      }
    },
    mounted() {
      this.canvas = null;
      this.ctx = null;
      this.scale = null;

      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.canvas.width = this.gridWidth * this.gridThickness;
      this.canvas.height = this.gridHeight * this.gridThickness;

      this.scale = new DesaturationScale(this.startColor, this.gridWidth, this.gridHeight);
      this.drawScale(this.scale);
    },
    methods: {
      drawScale(desatScale) {
        this.ctx.beginPath();
        desatScale.colorArray.forEach((column, widthIndex) => {
            column.forEach((color, heightIndex) => {
                this.ctx.fillStyle = color.getRGBString();
                this.ctx.fillRect(
                    widthIndex*this.gridThickness, 
                    heightIndex*this.gridThickness, 
                    (widthIndex+1)*this.gridThickness, 
                    (heightIndex+1)*this.gridThickness );
            })
        });
        this.ctx.closePath();
      }
    },
  }
</script>

<template>
  <canvas id="mainCanvas" class="main-canvas"></canvas>
</template>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
