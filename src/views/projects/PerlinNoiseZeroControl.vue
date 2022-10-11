<script>
  import PerlinNoiseZero from '@/components/projects/PerlinNoiseZero.vue';

  export default {
    data() {
      return {
        noiseDepth: 1000,
        seed: null,
        time: 0,
        scale: 25,
      }
    },
    mounted() {
      this.newSeed();
    },
    methods: {
      newSeed() {
        this.seed = Math.floor(Math.random() * 900000009 * 11111111);
      },
    },
    components: {
      PerlinNoiseZero,
    }
  }
</script>

<template>
  <div class="flex flex-dir-column">
    <div class="canvasContainer" ref="canvasContainer">
      <PerlinNoiseZero :seed="seed" :time="Number(time)" :scale="Number(scale)"/>
    </div>

    <div class="controls flex flex-dir-column">
        <div class="timelineContainer flex flex-justify-space-between">
            <label class="easy-on-the-eyes" for="timeline">Timeline:</label>
            <input type="range" id="timeline" min="0" :max="noiseDepth" step="10" v-model="time"/>
        </div>
        <div class="resolutionContainer flex flex-justify-space-between">
            <label class="easy-on-the-eyes" for="resolution">Resolution:</label>
            <input type="range" id="resolution" min="1" max="25" step="1" v-model="scale"/>
        </div>
        <button id="redraw" class="newNoise" @click='newSeed'>New Noise!</button>
    </div>
  </div>
</template>

<style scoped src="@/assets/css/views/perlin-noise-zero-control.css"></style>
