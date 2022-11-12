//importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

let canvas;
let ctx;

let workers = new Array(3);
let workersAtWork = 0;

init();

self.onmessage = event => {
  switch (event.data.msgType) {
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
  for (let i = 0; i < workers.length; i++) {
    workers[i] = new Worker('/public/workers/PerlinNoiseWasmWorker.js');
    workers[i].onmessage = (event) => {
      switch (event.data.msgType) {
        // when a worker is ready he clocks in
        case 'clockIn':
          workersAtWork++;
          checkTeam();
          break;
        case 'noise':

          break;
      }
    };
  }
}

function checkTeam() {
  if (workersAtWork == workers.length) {
    startTask();
  }
}

function startTask() {
  ctx.fillRect(0, 0, 50, 50);
}
