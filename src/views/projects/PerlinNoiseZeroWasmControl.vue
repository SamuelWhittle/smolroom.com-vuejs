<script>
  import PerlinNoiseZeroWasm from '@/components/projects/PerlinNoiseZeroWasm.vue';

  export default {
    data() {
      return {
        noiseDepth: 1000,
        seed: BigInt(Math.floor(Math.random() * 100)),
        time: 0,
        scale: 25,
      }
    },
    mounted() {
      this.newSeed();
    },
    methods: {
      newSeed() {
        this.seed = BigInt(Math.floor(Math.random() * 100));
      },
    },
    provide() {
      return {
        
      }
    },
    components: {
      PerlinNoiseZeroWasm,
    }
  }
</script>

<template>
  <div class="flex flex-dir-column">
    <div class="canvasContainer">
      <PerlinNoiseZeroWasm :seed="seed" :time="Number(time)" :scale="Number(scale)"/>
    </div>

    <div class="controls flex flex-dir-column">
        <div class="timelineContainer flex flex-justify-space-between">
            <label class="easy-on-the-eyes" for="timeline">Timeline:</label>
            <input type="range" id="timeline" min="0" :max="noiseDepth" step="10" v-model="time"/>
        </div>
        <div class="resolutionContainer flex flex-justify-space-between">
            <label class="easy-on-the-eyes" for="resolution">Square Size:</label>
            <input type="range" id="resolution" min="2" max="25" step="1" v-model="scale"/>
        </div>
        <button id="redraw" class="newNoise" @click='newSeed'>New Noise!</button>
    </div>
  </div>
</template>

<style scoped src="@/assets/css/views/perlin-noise-zero-control.css"></style>
