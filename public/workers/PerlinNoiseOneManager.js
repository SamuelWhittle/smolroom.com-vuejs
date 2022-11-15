importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

let canvas = null;
let ctx = null;

const { range_map } = wasm_bindgen;

loadWasm();

async function loadWasm() {
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
        ctx.imageSmoothingEnabled = false;
        break;
      case "terminate":
        //console.log("waiter terminated");
        self.close();
        break;
    }
  };

  postMessage({ msgType: "clockIn" });
}

function startWaiting(event) {
  //console.log('waiter started');
  // Deserialize data.
  const { swg, sabs, canvasDivisor, noiseWidth, noiseHeight } = event.data;
  const wg = WaitGroup.connect(swg);

  // Wait for workers to terminate.
  wg.wait();
  let noise = sabs.map((sab) => {
    return new Float64Array(sab);
  });

  // TODO: Draw the stuff
  ctx.fillStyle = `#000000`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < noiseWidth; x++) {
    for (let y = 0; y < noiseHeight; y++) {
      let index = y * noiseWidth + x;

      //console.log(noise[0][index], noise[1][index], noise[2][index]);
      let angle = noise[0][index];
      angle = range_map(angle, -1, 1, 0, Math.PI * 2) + Math.PI / 2;

      // Get color noise value and adjust contraints from -1 to 150 and from 1 to 250
      let color = noise[1][index];
      color = range_map(color, -1, 1, 150, 250);

      // Get intensity noise value
      let intensity = noise[2][index];
      // adjust intensity contraints from -1 to 0 and from 1 to 10, this is for line width
      let lineWidth = Math.floor(range_map(intensity, -1, 1, 3, 10));
      // adjust intensity contraints from -1 to 0 and from 1 to 150, this is for line length
      let length = range_map(intensity, -1, 1, -100, 300);
      let opacity = length / 300;
      if (length < 0) length = 0;
      // adjust intensity contraints from -1 to 0 and from 1 to 1, this is for line opacity
      //let opacity = range_map(intensity, -1, 1, -0.5, 1);

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`

      // calculate the endpoint of the line
      let lineEndX = x * canvasDivisor + Math.cos(angle) * length;
      let lineEndY = y * canvasDivisor + Math.sin(angle) * length;

      // Draw the inital line
      ctx.beginPath();
      ctx.moveTo(x * canvasDivisor, y * canvasDivisor);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();
      ctx.closePath();

      // Set accent color
      ctx.fillStyle = `hsla(${color}, 100%, 100%, ${opacity})`
      // Draw accent
      ctx.beginPath();
      ctx.arc(lineEndX, lineEndY, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  // give the main thread the performance number
  postMessage({ msgType: "finishedDrawing" });
}
