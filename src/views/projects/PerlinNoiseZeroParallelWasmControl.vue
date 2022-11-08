<template>
    <div class="canvasContainer">
      <PerlinNoiseZeroParallelWasm :concurrency="Number(concurrency)" 
        :seed="seed" 
        :time="Number(time)" 
        :scale="Number(scale)" 
        :smoothed="smoothed"/>
    </div>
    <div class="controls flex flex-dir-column">
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="timeline">Timeline:</label>
        <input class="slider" type="range" id="timeline" min="0" :max="noiseDepth" step="1" v-model="time"/>
      </div>
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="resolution">Square Size: {{this.scale}}</label>
        <input class="slider" type="range" id="resolution" min="1" max="25" step="1" v-model="scale"/>
      </div>
      <div class="control flex flex-justify-space-between">
        <label class="easy-on-the-eyes" for="concurrency">Concurrency:</label>
        <input id="concurrency" v-model="inputConcurrency" :onkeydown="checkEnter"/>
      </div>
      <div class="flex">
        <label class="easy-on-the-eyes" for="smoothed">Smoothed?:</label>
        <input class="checkbox" type="checkbox" id="smoothed" v-model="smoothed"/>
      </div>
      <button id="redraw" class="newNoise" @click='newSeed'>New Noise!</button>
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
        smoothed: false,
        inputConcurrency: window.navigator.hardwareConcurrency,
        concurrency: window.navigator.hardwareConcurrency,
      }
    },
    mounted() {
        this.debounceInput = this.debounce(() => {
            this.setConcurrency()
        }, 500);
    },
    methods: {
        newSeed() {
            this.seed = Math.floor(Math.random() * 1000);
        },
        checkEnter(event) {
            if (event.key === "Enter") {
                this.validateInputConcurrency();
            }
        },
        validateInputConcurrency() {
            console.log("validating");
            if (this.inputConcurrency > window.navigator.hardwareConcurrency) {
                this.inputConcurrency = window.navigator.hardwareConcurrency;
            } else if (this.inputConcurrency <= 1) {
                this.inputConcurrency = 1;
            }
            this.debounceInput();
        },
        setConcurrency() {
            console.log("setConcurrency", this.inputConcurrency);
            this.concurrency = this.inputConcurrency;
        },
        debounce(func, wait){
            let timeout;

            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };

                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    },
    components: {
        PerlinNoiseZeroParallelWasm,
    }
  }
</script>
