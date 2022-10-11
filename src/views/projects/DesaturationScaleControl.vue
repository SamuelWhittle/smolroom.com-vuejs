<script>
  import DesaturationScale from '@/components/projects/DesaturationScale.vue';
  import { Color } from '@/assets/classes/Color';

  export default {
    data() {
      return {
        gridWidth: 13,
        gridHeight: 23,
        gridThickness: 30,
        startColor: new Color(255, 128, 0),
      }
    },
    computed: {
      textColor() {
        return {
          color: this.startColor.getRGBString(),
        }
      },
    },
    components: {
      DesaturationScale,
    }
  }
</script>

<template>
<div class="main-content flex flex-dir-column">
  <div class="display-container" :style="{ 'aspect-ratio': gridWidth + '/' + gridHeight }">
    <DesaturationScale :grid-width="gridWidth" :grid-height="gridHeight" :grid-thickness="gridThickness" :start-color="startColor"/>
  </div>

    <div class="sliders flex flex-dir-column">
        <div class="flex flex-justify-space-between">
            <label for="redInput" :style="textColor">Red:</label>
            <input type="range" id="redInput" min="0" max="255" step="1" v-model="startColor.rgb[0]">
        </div>
        <div class="flex flex-justify-space-between">
            <label for="greenInput" :style="textColor">Green:</label>
            <input type="range" id="greenInput" min="0" max="255" step="1" v-model="startColor.rgb[1]">
        </div>
        <div class="flex flex-justify-space-between">
            <label for="blueInput" :style="textColor">Blue:</label>
            <input type="range" id="blueInput" min="0" max="255" step="1" v-model="startColor.rgb[2]">
        </div>
    </div>
</div>
</template>

<style scoped src="@/assets/css/views/desaturation-scale-control.css"></style>
