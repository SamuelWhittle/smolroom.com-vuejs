<template>
    <div class="canvasContainer">
      <PerlinNoiseZeroParallelWasm :concurrency="Number(activeConcurrency)" :seed="seed" :time="Number(time)" :scale="Number(scale)" :smoothed="smoothed"/>
    </div>
    <div class="controls flex flex-dir-column">
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="concurrency">Concurrency:</label>
        <input class="slider" type="range" id="concurrency" min="1" :max="concurrency" step="1" v-model="activeConcurrency"/>
      </div>
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="timeline">Timeline:</label>
        <input class="slider" type="range" id="timeline" min="0" :max="noiseDepth" step="1" v-model="time"/>
      </div>
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="resolution">Square Size: {{this.scale}}</label>
        <input class="slider" type="range" id="resolution" min="1" max="25" step="1" v-model="scale"/>
      </div>
      <div class="flex">
        <label class="easy-on-the-eyes" for="smoothed">Smoothed?:</label>
        <input class="checkbox" type="checkbox" id="smoothed" v-model="smoothed"/>
      </div>
      <button id="redraw" class="newNoise" @click='newSeed'>New Noise!</button>
    </div>
</template>

<script>
  import PerlinNoiseZeroParallelWasm from '@/components/projects/PerlinNoiseZeroParallelWasm.vue';

  export default {
    data() {
      return {
        noiseDepth: 100,
        seed: BigInt(Math.floor(Math.random() * 100)),
        time: 0,
        scale: 25,
        smoothed: true,
        concurrency: navigator.hardwareConcurrency,
        activeConcurrency: navigator.hardwareConcurrency,
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
      PerlinNoiseZeroParallelWasm,
    }
  }
</script>

<style scoped src="@/assets/css/views/perlin-noise-zero-control.css"></style>
