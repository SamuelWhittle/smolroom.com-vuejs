importScripts('/classes/ParallelSync.js');
//import { WaitGroup } from '/public/classes/ParallelSync.mjs';

let canvas = null;
let ctx = null;

let begin = null;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "startWaiting":
      begin = performance.now();
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

function startWaiting(event) {
  //console.log('waiter started');
  // Deserialize data.
  const { swg, sc, scale, noiseWidth, noiseHeight, smoothed } = event.data;
  const wg = WaitGroup.connect(swg);
  //imgData = new Int32Array(sc);

  // Wait for workers to terminate.
  wg.wait();

  // draw the noise
  ctx.imageSmoothingEnabled = smoothed;

  let imgData = new ImageData(noiseWidth, noiseHeight);

  imgData.data.set(Uint8ClampedArray.from(new Int32Array(sc)));

  createImageBitmap(imgData).then((bitMap) => {
    ctx.drawImage(bitMap, 0, 0, imgData.width * scale, imgData.height * scale);
  });

  // give the main thread the performance number
  postMessage({ msgType: "finishedDrawing", performance: (performance.now() - begin) });
}
