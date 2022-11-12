//importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

//const PerlinNoise = wasm_bindgen.PerlinNoise;

//loadWasm();

let canvas;
let ctx;

let angleNoiseWorker;
let colorNoiseWorker;
let intesityNoiseWorker;

init();

self.onmessage = event => {
  switch (event.data.msgType) {
    case "startTask":
      startTask(event);
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;
      break;
    case 'canvas':
      canvas = event.data.canvas;
      ctx = canvas.getContext('2d');
      break;
    case "terminate":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

function init() {
  angleNoiseWorker = 
}

/*async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  self.onmessage = event => {
    switch (event.data.msgType) {
      case "startWaiting":
        startWaiting(event);
        break;
      case 'resizeCanvas':
        canvas.width = event.data.width;
        canvas.height = event.data.height;
        break;
      case 'canvas':
        canvas = event.data.canvas;
        ctx = canvas.getContext('2d');
        break;
      case "terminate":
        //console.log("waiter terminated");
        self.close();
        break;
    }
  };
}*/

function startTask(event) {
  //console.log('waiter started');
  // Deserialize data.
  const { scale, noiseWidth, noiseHeight } = event.data;



  // give the main thread the performance number
  postMessage({ msgType: "finishedTask" });
}
