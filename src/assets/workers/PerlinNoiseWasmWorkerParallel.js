importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

const PerlinNoise = wasm_bindgen.PerlinNoise;
const { range_map } = wasm_bindgen;

loadWasm();

async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  self.onmessage = event => {
    switch (event.data.msgType) {
      case "getNoise":
        getNoise(event);
        break;
      case "terminate":
        //console.log("worker terminated");
        self.close();
        break;
    }
  };

  //console.log("wasm worker initialized...");
  postMessage({msgType: "clockIn"});
}

function getNoise(event) {
    // Deserialize data.
    const {
      swg, smu, sc,
      groupTotal, id,
      numOctaves, octaveScale, seed,
      time,
      width, scale,
      xScale, yScale, tScale
    } = event.data;
    const wg = WaitGroup.connect(swg);
    const mu = Mutex.connect(smu);
    const noiseImgData = new Int32Array(sc);

    let noiseGen = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));

    let workerStartPixel = Math.floor(noiseImgData.length / 4 * (id / groupTotal));
    let nextWorkerStartPixel = Math.floor(noiseImgData.length / 4 * ((id + 1) / groupTotal));

    //array of noise values for this workers area
    let workerSpecificNoise = noiseGen.get_noise_array(
        // new array the length of this workers area
        new Array(nextWorkerStartPixel - workerStartPixel).fill()
          // fill with ImageData indices 
          .map((_, index) => index + workerStartPixel)
          // convert indices into positions
          .flatMap((index) => {
            return [
              (index % width) * scale * xScale,
              Math.floor(index / width) * scale * yScale,
              time * tScale
            ]
          }), 3
    );

    mu.lock();

    //const startIndex = Math.floor(noise.length * (id / groupTotal));
    ////console.log({id, groupTotal, byteLength: noise.length});
    ////console.log(`start of critical section for worker ${id}`);
    // This section does not require atomic operations, the mutex takes care of it.
    // This allows to do complex operations with the guarantee that no other worker
    // is in it. For example we could modify multiple sections of the array without
    // worrying that some might have changed before we are done.
    for (let i = workerStartPixel * 4, noiseIndex = 0; i < nextWorkerStartPixel * 4; i+=4, noiseIndex++) {
      noiseImgData[i] = noiseImgData[i+1] = noiseImgData[i+2] = range_map(workerSpecificNoise[noiseIndex], -0.8, 0.8, 0, 255);
      noiseImgData[i+3] = 255;
    }


    ////console.log("end of critical section");
    mu.unlock();

    // Simulate intensive computation.
    //for (let i=0;i<100000;i++);

    // Signal termination.
    //console.log('worker done');
    wg.done();
}
