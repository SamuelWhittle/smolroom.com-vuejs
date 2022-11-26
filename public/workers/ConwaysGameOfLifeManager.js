console.log("ConwaysGameOfLifeManager");

let canvas, ctx;
let cDiv;
let cells = new Array();

let interval;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "toggleTask":
      toggleTask(event.data.state, event.data.fps);
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;
      draw();
      break;
    case 'task':
      canvas = event.data.canvas;
      cDiv = event.data.cDiv;

      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 1;

      if (event.data.randomStart) {
        randomizeCells();
      }

      draw();

      postMessage({ msgType: "ready" });
      break;
    case "randomizeCells":
      randomizeCells();
      break;
    case "clearCells":
      clearCells();
      break;
    case "cellUpdate":
      updateCell(event.data.x, event.data.y);
      break;
    case "terminate":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

postMessage({ msgType: "clockIn" });

function toggleTask(state, fps) {
  if (state) {
    setTimeInterval(fps);
  } else {
    clearTimeInterval();
  }
}

function draw() {
  drawGrid();
  drawCells();
}

function drawGrid() {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#808080';
  ctx.beginPath();
  for (let x = 0; x < canvas.width / cDiv; x++) {
    ctx.moveTo(x * cDiv, 0);
    ctx.lineTo(x * cDiv, canvas.height);
  }
  for (let y = 0; y < canvas.height / cDiv; y++) {
    ctx.moveTo(0, y * cDiv);
    ctx.lineTo(canvas.width, y * cDiv);
  }
  ctx.stroke();
}

function drawCells() {
  ctx.fillStyle = '#000000';
  let path = new Path2D();

  cells.forEach((val) => {
    let cell = JSON.parse(val);
    path.rect(cell[0] * cDiv + 1, cell[1] * cDiv + 1, cDiv - 2, cDiv - 2);
  });

  ctx.fill(path);
}

function updateCell(x, y) {
  let cellX = Math.floor(x / cDiv);
  let cellY = Math.floor(y / cDiv);

  let index = cells.indexOf(`[${cellX},${cellY}]`);

  if (index == -1) {
    cells.push(`[${cellX},${cellY}]`);
  }/* else {
    cells.splice(index, 1);
  }*/

  draw();
}

function updateLife() {
  // remove duplicates and keep cells in json form
  //console.log(cells);
  currentCells = [...new Set(cells)]
  //console.log(currentCells);

  // next gen of cells
  let nextGen = new Array();

  //console.log(currentCells);
  let numCellsW = Math.ceil(canvas.width / cDiv);
  let numCellsH = Math.ceil(canvas.height / cDiv);

  [...new Set(currentCells.map(JSON.parse)
    .map((val) => {
      //determine alive neighbors
      let neighbors = new Array();

      for (let x = 1; x >= -1; x -= 1) {
        for (let y = 1; y >= -1; y -= 1) {
          nX = (val[0] + x) % numCellsW;
          if (nX == -1)
            nX = numCellsW - 1;
          nY = (val[1] + y) % numCellsH;
          if (nY == -1)
            nY = numCellsH - 1;

          neighbors.push(`[${nX},${nY}]`);
        }
      }

      return neighbors;
    })
    .flatMap(num => num))]
    .forEach((cell) => {
      let val = JSON.parse(cell);
      let total = 0;
      let currentState = false;

      //console.log(`checking: ${val}`);
      for (let x = 1; x >= -1; x -= 1) {
        for (let y = 1; y >= -1; y -= 1) {
          nX = (val[0] + x) % numCellsW;
          if (nX == -1)
            nX = numCellsW - 1;
          nY = (val[1] + y) % numCellsH;
          if (nY == -1)
            nY = numCellsH - 1;
          //console.log(nX, nY);
          if (currentCells.indexOf(`[${nX},${nY}]`) != -1) {
            //console.log("found cell");
            if (x == 0 && y == 0) {
              currentState = true;
              //console.log(currentState);
            }
            total++;
          }
        }
      }
      //console.log(`total: ${total}`);

      if (total == 3 || (total == 4 && currentState)) {
        //console.log(`pushing: ${[val[0], val[1]]}`);
        nextGen.push(`[${val[0]},${val[1]}]`);
        //return [nX, nY];
      }
    });

  cells = nextGen;
  //console.log(cells);
}

function update() {
  updateLife();
  draw();
}

function randomizeCells() {
  cells = new Array();
  let gridWidth = canvas.width / cDiv;
  let gridHeight = canvas.height / cDiv;

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      let temp = Math.random()
      if (temp >= 0.5) {
        cells.push(`[${x},${y}]`);
      }
    }
  }
  draw();
}

function clearCells() {
  cells = new Array();

  draw();
}

function setTimeInterval(fps) {
  clearTimeInterval();

  interval = setInterval(update, 1000 / fps);
}

function clearTimeInterval() {
  if (interval) {
    clearInterval(interval);
  }
}
