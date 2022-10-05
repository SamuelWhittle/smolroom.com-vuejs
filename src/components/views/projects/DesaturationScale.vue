<script setup>
  import { Color } from '@/assets/classes/Color';
  import { DesaturationScale } from '@/assets/classes/DesaturationScale';
</script>

<script>
  export default {
    data() {
      return {
        canvas: null,
        ctx: null,
        scale: null,
        color: new Color(255, 128, 0),
        gridWidth: 13,
        gridHeight: 23,
        gridThickness: 20,
      }
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.canvas.width = this.gridWidth * this.gridThickness;
      this.canvas.height = this.gridHeight * this.gridThickness;

      this.scale = new DesaturationScale(this.color, this.gridWidth, this.gridHeight);
      this.drawScale(this.scale);
    },
    methods: {
      inputProcess() {
        this.drawScale(new DesaturationScale(this.color, this.gridWidth, this.gridHeight));
      },
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
    computed: {
      textColor() {
        return {
          color: this.color.getRGBString(),
        }
      },
    }
  }
</script>

<template>
<div class="main-content flex flex-dir-column">
    <canvas id="mainCanvas" class="main-canvas"></canvas>

    <div class="sliders flex flex-dir-column">
        <div class="flex flex-justify-space-between">
            <label for="redInput" :style="textColor">Red:</label>
            <input type="range" id="redInput" min="0" max="255" step="1" v-model="color.rgb[0]" @input="inputProcess">
        </div>
        <div class="flex flex-justify-space-between">
            <label for="greenInput" :style="textColor">Green:</label>
            <input type="range" id="greenInput" min="0" max="255" step="1" v-model="color.rgb[1]" @input="inputProcess">
        </div>
        <div class="flex flex-justify-space-between">
            <label for="blueInput" :style="textColor">Blue:</label>
            <input type="range" id="blueInput" min="0" max="255" step="1" v-model="color.rgb[2]" @input="inputProcess">
        </div>
    </div>
</div>
</template>

<style scoped src="@/assets/css/desaturation-scale.css"></style>
