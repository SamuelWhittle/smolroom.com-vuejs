importScripts('/wasm/perlin_noise/perlin_noise.js');

console.log('Initializing worker...')

// In the worker, we have a different struct that we want to use as in
// `index.js`.
const { PerlinNoise } = wasm_bindgen;

async function init_wasm_in_worker() {
  // Load the wasm file by awaiting the Promise returned by `wasm_bindgen`.
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');
  console.log('Worker ready...');

  // Create a new object of the `PerlinNoise` struct
  var noise = PerlinNoise.multi_octave_with_seed(3, 1/3, BigInt(0));

  // Set callback to handle messages passed to the worker.
  self.onmessage = async event => {
    console.log('Worker received message');
    console.log(event.data);
    // By using methods of a struct as reaction to messages passed to the
    // worker, we can preserve our state between messages.
    var worker_result = noise.get_fractal_noise_value([event.data]);

    // Send response back to be handled by callback in main thread.
    self.postMessage(worker_result);
  }
}

init_wasm_in_worker();
