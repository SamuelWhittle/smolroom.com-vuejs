importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

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
        //console.log("worker terminated");
        self.close();
        break;
    }
  };

  //console.log("wasm worker initialized...");
  postMessage({ msgType: "clockIn" });
}

function getNoiseArray(event) {
  // Deserialize data.
  const {
    numOctaves, octaveScale, seed,
    coords, numDims
  } = event.data;

  let noiseGen = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));

  //array of noise values for this workers area
  let noise = noiseGen.get_noise_array(coords, numDims);

  postMessage({ msgType: "noise", noise: noise });
}
