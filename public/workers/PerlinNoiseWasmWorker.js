importScripts('/wasm/perlin_noise/perlin_noise.js');

console.log('Worker initializing...')

const PerlinNoise = wasm_bindgen.PerlinNoise;
const { range_map } = wasm_bindgen;

let canvas = null;
let ctx = null;

let scale = null;
let smoothed = null;
let time = null;
let numOctaves = null;
let octaveScale = null;
let seed = null;

loadWasm();

async function loadWasm() {
  await wasm_bindgen('/wasm/perlin_noise/perlin_noise_bg.wasm');

  console.log("wasm loaded in worker...");

  self.onmessage = event => {
    switch (event.data.msgType) {
      case 'drawNoiseArray':
        scale = event.data.scale;
        smoothed = event.data.smoothed;
        time = event.data.time;
        numOctaves = event.data.numOctaves;
        octaveScale = event.data.octaveScale;
        seed = event.data.seed;
        drawNoise();
        postMessage({msgType: "drawingFinished"});
        break;
      case 'resize':
        canvas.width = event.data.width;
        canvas.height = event.data.height;
        break;
      case 'canvas':
        canvas = event.data.canvas;
        ctx = canvas.getContext('2d');
        break;
      default:
        postMessage({msgType: "error", errorMsg: `unhandled msgType: ${event.data.msgType}`});
        break;
    }
  };

  postMessage({msgType: "loaded"});
}

function drawNoise() {
  let begin = performance.now();
  
  if (smoothed) {
    drawSmoothed(scale);
  } else {
    drawSquares(scale);
  }

  console.log(performance.now() - begin);
}

function drawSmoothed(scale) {
  let noise = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));

  let xScale = 0.006;
  let yScale = 0.006;
  let tScale = 0.06;

  let imgData = new ImageData(Math.ceil(canvas.width / scale), Math.ceil(canvas.height / scale));

  imgData.data.set(
    Uint8ClampedArray.from(
      Array.from(noise.get_noise_array(
        new Array(Math.ceil(canvas.height / scale)).fill()
        .flatMap((_, y) => new Array(Math.ceil(canvas.width / scale)).fill()
          .flatMap((_, x) => [x * scale * xScale, y * scale * yScale, time * tScale]))
        , 3))
      .map((value) => Math.round(range_map(value, -0.8, 0.8, 0, 255)))
      .flatMap((value) => [value, value, value, 255])
    )
  );

    createImageBitmap(imgData).then((bitMap) => {
      ctx.drawImage(bitMap, 0, 0, imgData.width * scale, imgData.height * scale);
    });

}

function drawSquares(scale) {
  let noise = PerlinNoise.multi_octave_with_seed(numOctaves, octaveScale, BigInt(seed));

  let xScale = 0.006;
  let yScale = 0.006;
  let tScale = 0.06;

  for(let x = 0; x < canvas.width; x += scale) {
    for(let y = 0; y < canvas.height; y += scale) {
      let color = noise.get_fractal_noise_value([x * xScale, y * yScale, time * tScale]);
      let r, g, b;
      r = g = b = range_map(color, -0.8, 0.8, 0, 255);
      ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, scale, scale);
    }
  }
}
