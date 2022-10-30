<template>
    <div class="canvasContainer">
      <PerlinNoiseZeroParallelWasm :seed="seed" :time="Number(time)" :scale="Number(scale)" :smoothed="smoothed" @drawing-toggle="drawingStateChange"/>
    </div>
    <div class="controls flex flex-dir-column">
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="timeline">Timeline:</label>
        <input class="slider" type="range" id="timeline" min="0" :max="noiseDepth" step="1" v-model="time" :disabled='controlsDisabled'/>
      </div>
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="resolution">Square Size: {{this.scale}}</label>
        <input class="slider" type="range" id="resolution" min="1" max="25" step="1" v-model="scale" :disabled='controlsDisabled'/>
      </div>
      <div class="flex">
        <label class="easy-on-the-eyes" for="smoothed">Smoothed?:</label>
        <input class="checkbox" type="checkbox" id="smoothed" v-model="smoothed" :disabled='controlsDisabled'/>
      </div>
      <button id="redraw" class="newNoise" @click='newSeed' :disabled='controlsDisabled'>New Noise!</button>
    </div>
</template>

<style scoped src="@/assets/css/views/perlin-noise-zero-control.css"></style>

<script>
  import PerlinNoiseZeroParallelWasm from '@/components/projects/PerlinNoiseZeroParallelWasm.vue';

  export default {
    data() {
      return {
        noiseDepth: 100,
        seed: Math.floor(Math.random() * 1000),
        time: 0,
        scale: 25,
        smoothed: true,
        controlsDisabled: false,
      }
    },
    mounted() {
      //this.newSeed();
    },
    methods: {
      newSeed() {
        this.seed = Math.floor(Math.random() * 1000);
      },
      drawingStateChange(isDrawing) {
        this.controlsDisabled = isDrawing;
      },
    },
    components: {
      PerlinNoiseZeroParallelWasm,
    }
  }
</script>
