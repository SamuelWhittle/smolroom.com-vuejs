importScripts('/wasm/perlin_noise/perlin_noise.js', '/classes/ParallelSync.js');

const PerlinNoise = wasm_bindgen.PerlinNoise;

loadWasm();

async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  self.onmessage = event => {
    switch (event.data.msgType) {
      case "getNoiseArray":
        getNoiseArray(event);
        break;
      case "terminate":
        self.close();
        break;
    }
  };

  console.log("worker initialized. clocking in...");
  postMessage({ msgType: "clockIn" });
}


function getNoiseArray(event) {
  const {
    swg, mu, sab,
    numOctaves, octaveScale, seed,
    coords, numDims
  } = event.data;

  const wg = WaitGroup.connect(swg);
  const noiseMu = Mutex.connect(mu);
  let noiseData = new Int32Array(sab);

  let noiseGen = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));

  //array of noise values for this workers area
  let noise = noiseGen.get_noise_array(coords, numDims);

  noiseMu.lock();

  noiseData = [...noise];

  noiseMu.unlock();

  wg.done();
}
