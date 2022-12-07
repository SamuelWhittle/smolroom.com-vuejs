importScripts('/classes/ParallelSync.js', '/wasm/perlin_noise/perlin_noise.js');

let initializing = true;

let wg;

let workers, workersAtWork;
let sabs;
let seeds = new Array(3).fill();

let canvas, ctx;

let noise, numOctaves, octaveScale, time;
let xScale, yScale, tScale;

let cDiv, nWidth, nHeight;

let lastCalledTime, fps;
let drawInterval;
let drawing = false;

let colorPaths = 8;
let opacityPaths = 8;
let widthPaths = 8;
let linePaths, dotPaths;

const { range_map } = wasm_bindgen;

loadWasm();

async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  self.onmessage = event => {
    switch (event.data.msgType) {
      case 'resizeCanvas':
        canvas.width = event.data.width;
        canvas.height = event.data.height;

        initWorkersTask();
        break;
      case 'task':
        canvas = event.data.canvas;
        ctx = canvas.getContext('2d', {
          alpha: false,
          desynchronized: true,
          preserveDrawingBuffer: true
        });
        ctx.imageSmoothingEnabled = false;

        cDiv = event.data.canvasDivisor;
        numOctaves = event.data.numOctaves;
        octaveScale = event.data.octaveScale;
        xScale = event.data.xScale;
        yScale = event.data.yScale;
        tScale = event.data.tScale;

        initWorkersTask();
        break;
      case "terminate":
        //console.log("waiter terminated");
        clearDrawInterval();
        self.close();
        break;
    }
  };

  init();
}

function init() {
  //cleanup
  terminateAllWorkers();

  workersAtWork = 0;
  workers = new Array(3).fill();
  wg = new WaitGroup(3);

  time = 0;
  sabs = new Array(3);

  seeds = seeds.map((_, index) => Math.floor(Math.random() * 1000) + index)

  //paths = new Array(colorPaths).fill(new Array(opacityPaths).fill(new Array(widthPaths).fill(new Path2D())))
  linePaths = new Array(colorPaths * opacityPaths * widthPaths).fill(new Path2D());
  dotPaths = new Array(colorPaths * opacityPaths * widthPaths).fill(new Path2D());

  for (let i = 0; i < workers.length; i++) {
    //this.workers[i] = new Worker(new URL('../../assets/workers/PerlinNoiseZeroWasmWorker.js', import.meta.url));
    workers[i] = new Worker('/workers/PerlinNoiseOneWorker.js');
    workers[i].onmessage = (event) => {
      switch (event.data.msgType) {
        // when a worker is ready he clocks in
        case 'clockIn':
          workersAtWork++;
          checkWorkerCount();
          break;
      }
    };
  }
}

function clockIn() {
  postMessage({ msgType: "clockIn" });
}

function checkWorkerCount() {
  if (workersAtWork >= workers.length) {
    clockIn();
  }
}

function terminateAllWorkers() {
  // tell every worker they are terminated
  if (workers) {
    for (let i = 0; i < workers.length; i++) {
      workers[i].postMessage({ msgType: "terminate" });
    }
  }
}

function initWorkersTask() {
  nWidth = Math.ceil(canvas.width / cDiv) + 3;
  nHeight = Math.ceil(canvas.height / cDiv) + 3;

  sabs[0] = new SharedArrayBuffer(nWidth * nHeight * 8);
  sabs[1] = new SharedArrayBuffer(nWidth * nHeight * 8);
  sabs[2] = new SharedArrayBuffer(nWidth * nHeight * 8);

  initializing = false;

  //requestAnimationFrame(draw);
  setDrawInterval();
}

function draw() {
  for (let i = 0; i < workers.length; i++) {
    workers[i].postMessage({
      msgType: "getNoiseArray",
      swg: wg, sab: sabs[i],
      numOctaves: numOctaves, octaveScale: octaveScale, seed: seeds[i],
      time: time,
      noiseWidth: nWidth, canvasDivisor: cDiv,
      xScale: xScale, yScale: yScale, tScale: tScale,
    });
  }

  wg.wait();

  noise = sabs.map((sab) => {
    return new Float64Array(sab);
  });

  // TODO: Draw the stuff
  ctx.fillStyle = `#000000`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < nWidth; x++) {
    for (let y = 0; y < nHeight; y++) {
      let index = y * nWidth + x;

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
      // adjust intensity contraints from -1 to 0 and from 1 to 1, this is for line opacity
      let opacity = length / 300;

      if (length <= 0 || opacity <= 0) continue;

      // calculate the endpoint of the line
      let lineEndX = x * cDiv + Math.cos(angle) * length;
      let lineEndY = y * cDiv + Math.sin(angle) * length;

      // Draw the inital line
      ctx.lineWidth = lineWidth;
      //ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`
      const gradient = ctx.createRadialGradient(x * cDiv, y * cDiv, Math.floor(length / 5), x * cDiv, y * cDiv, length);
      gradient.addColorStop(0, `hsla(0, 0%, 0%, 0)`);
      gradient.addColorStop(1, `hsla(${color}, 100%, 50%, ${opacity})`);
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x * cDiv, y * cDiv);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();

      // Set accent color
      ctx.fillStyle = `hsla(${color}, 100%, 75%, ${opacity})`
      //ctx.fillStyle = `hsl(${color}, 100%, 100%)`
      // Draw accent
      ctx.beginPath();
      ctx.arc(lineEndX, lineEndY, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  time++;
  wg.add(3);
  //requestAnimationFrame(draw);
}

function drawPaths() {
  for (let i = 0; i < workers.length; i++) {
    workers[i].postMessage({
      msgType: "getNoiseArray",
      swg: wg, sab: sabs[i],
      numOctaves: numOctaves, octaveScale: octaveScale, seed: seeds[i],
      time: time,
      noiseWidth: nWidth, canvasDivisor: cDiv,
      xScale: xScale, yScale: yScale, tScale: tScale,
    });
  }

  wg.wait();

  noise = sabs.map((sab) => {
    return new Float64Array(sab);
  });

  // TODO: Draw the stuff
  ctx.fillStyle = `#000000`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();

  for (let x = 0; x < nWidth; x++) {
    for (let y = 0; y < nHeight; y++) {
      let index = y * nWidth + x;

      //console.log(noise[0][index], noise[1][index], noise[2][index]);
      let angle = noise[0][index];
      angle = range_map(angle, -1, 1, 0, Math.PI * 2) + Math.PI / 2;

      // Get color noise value
      let color = noise[1][index];

      // Get color path number
      let colorPath = Math.floor(range_map(color, -1, 1, 0, colorPaths));

      // Get intensity noise value
      let intensity = noise[2][index];

      // Get width path number
      let widthPath = Math.floor(range_map(intensity, -1, 1, 0, widthPaths));

      // Get opacity path number
      let opacityPath = Math.floor(range_map(intensity, -1, 1, 0, opacityPaths));

      let pathIndex = getSingleDim(widthPath, opacityPath, colorPath, opacityPaths, colorPaths);

      // adjust intensity contraints from -1 to 0 and from 1 to 150, this is for line length
      let length = range_map(intensity, -1, 1, -100, 300);

      let opacity = length / 300;

      if (length <= 0 || opacity <= 0) continue;

      // calculate the endpoint of the line
      let lineEndX = x * cDiv + Math.cos(angle) * length;
      let lineEndY = y * cDiv + Math.sin(angle) * length;

      // Draw the inital line

      linePaths[pathIndex].moveTo(x * cDiv, y * cDiv);
      linePaths[pathIndex].lineTo(lineEndX, lineEndY);

      // Set accent color
      let lineWidth = Math.floor(range_map(intensity, -1, 1, 3, 10));
      dotPaths[pathIndex].moveTo(lineEndX, lineEndY);
      dotPaths[pathIndex].arc(lineEndX, lineEndY, lineWidth / 2, 0, Math.PI * 2);
    }
  }

  linePaths.forEach((path, index) => {
    let pathInfo = getThreeDims(index, opacityPaths, colorPaths);
    let color = range_map(pathInfo.color, 0, colorPaths - 1, 150, 250);
    let opacity = range_map(pathInfo.opacity, 0, opacityPaths - 1, 0, 1);

    ctx.lineWidth = pathInfo.width + 3;
    //console.log(range_map(pathInfo.opacity, 0, opacityPaths - 1, -0.15, 1));
    ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`
    ctx.stroke(path);
    linePaths[index] = new Path2D();


    ctx.fillStyle = `hsla(${color}, 100%, 80%, ${opacity})`
    // Draw accent
    ctx.fill(dotPaths[index]);
    dotPaths[index] = new Path2D();
  })

  time++;
  wg.add(3);
  //requestAnimationFrame(draw);
}

function setDrawInterval() {
  clearDrawInterval();
  drawInterval = setInterval(draw, 1000 / 60);
}

function clearDrawInterval() {
  if (drawInterval) {
    clearInterval(drawInterval);
  }
}

function getSingleDim(z, y, x, yl, xl) {
  return (z * yl * xl) + (y * xl) + x
}

function getThreeDims(n, yl, xl) {
  return {
    width: Math.floor(n / (yl * xl)),
    opacity: Math.floor(n / yl / xl),
    color: n % xl
  }
}

