
importScripts('/wasm/perlin_noise/perlin_noise.js');

console.log('Worker initializing...')

const PerlinNoise = wasm_bindgen.PerlinNoise;
const { range_map } = wasm_bindgen;

loadWasm();

async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  console.log("wasm worker initialized...");

  self.onmessage = event => {
    console.log(`worker ${id} started`);

    // Deserialize data.
    const {swg, smu, sc, id} = event.data;
    const wg = WaitGroup.connect(swg);
    const mu = Mutex.connect(smu);
    const noise = new Int32Array(sc);

    mu.lock();
    console.log("start of critical section");
    // This section does not require atomic operations, the mutex takes care of it.
    // This allows to do complex operations with the guarantee that no other worker
    // is in it. For example we could modify multiple sections of the array without
    // worrying that some might have changed before we are done.


    console.log("end of critical section");
    mu.unlock();

    // Simulate intensive computation.
    for (let i=0;i<100000;i++);

    // Signal termination.
    console.log('worker done');
    wg.done();
  };
}
