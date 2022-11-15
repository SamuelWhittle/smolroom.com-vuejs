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
        //console.log("worker terminated");
        self.close();
        break;
    }
  };

  postMessage({ msgType: "clockIn" });
}


function getNoiseArray(event) {
  const {
    swg, sab,
    numOctaves, octaveScale, seed,
    time,
    noiseWidth, canvasDivisor,
    xScale, yScale, tScale
  } = event.data;

  const wg = WaitGroup.connect(swg);

  let noiseData = new Float64Array(sab);

  let noiseGen = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));
  //array of noise values for this workers area
  let noise = noiseGen.get_noise_array(
    // new array the length of the number of noise values needed
    new Array(noiseData.length).fill()
      // fill an index with it's index value
      .map((_, index) => index)
      // convert indices into positions
      .flatMap((index) => {
        return [
          (index % noiseWidth) * canvasDivisor * xScale,
          Math.floor(index / noiseWidth) * canvasDivisor * yScale,
          time * tScale
        ]
      }), 3
  );

  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = noise[i];
  }

  wg.done();
}
