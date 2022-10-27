<template>
  <div>
    <canvas id="mainCanvas" class="main-canvas" @click="test"></canvas>
  </div>
</template>

<script>
  import { State } from '@/assets/classes/PerlinNoise';

  export default {
    props: {
      seed: {
        type: BigInt,
        default: BigInt(0),
      },
      numOctaves: {
        type: Number,
        default: 3,
      },
      octaveScale: {
        type: Number,
        default: 0.75,
      },
      time: {
        type: Number,
        required: true,
      },
      scale: {
        type: Number,
        required: true,
      },
      smoothed: {
        type: Boolean,
        default: false
      },
      concurrency: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        wasmLoaded: false,
      }
    },
    watch: {
      seed: {
        handler() {
          //this.draw();
        }
      },
      time: {
        handler() {
          if (this.wasmLoaded) {
            console.time('render');
            this.render(new PerlinNoise())
          }
          //this.draw();
        }
      },
      scale: {
        handler() {
          //this.draw();
        }
      },
      smoothed: {
        handler() {
          //this.draw();
        }
      },
    },
    mounted() {
      this.canvas = document.getElementById('mainCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.parentResizeObserver = new ResizeObserver(() => {
        this.canvas.width = this.$el.parentNode.clientWidth;
        this.canvas.height = this.$el.parentNode.clientHeight;
        //this.draw();
      });

      this.parentResizeObserver.observe(this.$el.parentNode);

      this.rendering = null;
      this.start = null;
      this.interval = null;
      this.pool = null;

      // GET function form global was_bindgen object
      this.PerlinNoise = wasm_bindgen.PerlinNoise;
      this.range_map = wasm_bindgen.range_map;
      this.startup = wasm_bindgen.startup;

      this.loadWasm(); 
    },
    beforeUnmount() {
      if (this.parentResizeObserver != null) {
        this.parentResizeObserver.disconnect();
      }
    },
    methods: {
      loadWasm() {
        let msg = 'This demo requires a current version of Firefox (e.g., 79.0)';

        if (!window.Worker) {
          alert('This browser does not have Web Worker support.');
        }

        /*if (typeof SharedArrayBuffer !== 'function') {
          alert('This browser does not have SharedArrayBuffer support enabled' + '\n\n' + msg);
          return
        }*/
        // Test for bulk memory operations with passive data segments
        //  (module (memory 1) (data passive ""))
        const buf = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x05, 0x03, 0x01, 0x00, 0x01, 0x0b, 0x03, 0x01, 0x01, 0x00]);
        if (!WebAssembly.validate(buf)) {
          alert('This browser does not support passive wasm memory, demo does not work' + '\n\n' + msg);
          return
        }

        wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm')
          .then(this.run)
          .catch(console.error);
      },
      run() {
        this.wasmLoaded = true;
        // The maximal concurrency of our web worker pool is `hardwareConcurrency`,
        // so set that up here and this ideally is the only location we create web
        // workers.
        this.pool = new WorkerPool(this.concurrency);

        console.time('render');
        this.render(new PerlinNoise())
      },
      render(perlinNoise) {
        if (this.rendering) {
          this.rendereing.stop();
          this.rendering = null;
        }
        this.rendering = new State(perlinNoise.render(parseInt(this.concurrency), pool), this.ctx)
      },
      mainDrawSmoothed() {
        let ctx = this.canvas.getContext('2d');

        let noise = this.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);
        
        let xScale = 0.006;
        let yScale = 0.006;
        let tScale = 0.06;

        let imgData = new ImageData(Math.ceil(this.canvas.width / this.scale), Math.ceil(this.canvas.height / this.scale));

        imgData.data.set(
          Uint8ClampedArray.from(
            Array.from(noise.get_noise_array(
              new Array(Math.ceil(this.canvas.height / this.scale)).fill()
                .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
                .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale]))
            , 3))
              .map((value) => Math.round(this.range_map(value, -0.8, 0.8, 0, 255)))
              .flatMap((value) => [value, value, value, 255])
          )
        );

        /*let noisePositions = new Array(Math.ceil(this.canvas.height / this.scale)).fill()
          .flatMap((_, y) => new Array(Math.ceil(this.canvas.width / this.scale)).fill()
          .flatMap((_, x) => [x * this.scale * xScale, y * this.scale * yScale, this.time * tScale]));
        
        imgData.data.set(
          Uint8ClampedArray.from(
            Array.from(noise.get_noise_img_data(noisePositions, 3))
              .map((value) => Math.round(wasm.PerlinNoise.range_map(value, -0.8, 0.8, 0, 255)))
              .flatMap((value) => [value, value, value, 255])
          )
        );*/

        createImageBitmap(imgData).then((bitMap) => {
          ctx.drawImage(bitMap, 0, 0, imgData.width * this.scale, imgData.height * this.scale);
        });

      },
      mainDrawSquares() {
        let ctx = this.canvas.getContext('2d');

        let noise = this.PerlinNoise.multi_octave_with_seed(this.numOctaves, this.octaveScale, this.seed);
        
        let xScale = 0.006;
        let yScale = 0.006;
        let tScale = 0.06;

        for(let x = 0; x < this.canvas.width; x += this.scale) {
          for(let y = 0; y < this.canvas.height; y += this.scale) {
            let color = noise.get_fractal_noise_value([x * xScale, y * yScale, this.time * tScale]);
            let r, g, b;
            r = g = b = this.range_map(color, -0.8, 0.8, 0, 255);
            ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, this.scale, this.scale);
          }
        }
        
      },
      draw() {
        if (this.wasmLoaded) {
          let begin = performance.now();
          
          if (this.smoothed) { 
            this.mainDrawSmoothed();
          } else {
            this.mainDrawSquares();
          }
          
          console.log(performance.now() - begin);
        } else {
          console.log("loading WASM ...");
        }
      },
    }
  }
</script>

<style scoped src="@/assets/css/components/canvas-component-base.css"></style>
