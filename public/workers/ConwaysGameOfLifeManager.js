let canvas, ctx;
let cDiv;
let cells = {};
let neighborhood = [[1, 1], [0, 1], [-1, 1], [1, 0], [0, 0], [-1, 0], [1, -1], [0, -1], [-1, -1]]

let lastUpdated;

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
    case "clearLastUpdated":
      lastUpdated = "";
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
  ctx.fillStyle = '#16161d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#000000';
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
  ctx.fillStyle = '#FF8800';
  let path = new Path2D();

  for (const loc in cells) {
    path.rect(cells[loc].x * cDiv + 1, cells[loc].y * cDiv + 1, cDiv - 2, cDiv - 2);
  }

  ctx.fill(path);
}

function updateCell(x, y) {
  let cellX = Math.floor(x / cDiv);
  let cellY = Math.floor(y / cDiv);

  let loc = `${cellX},${cellY}`;

  if (lastUpdated === loc) return;

  if (loc in cells) {
    delete cells[loc];
  } else {
    cells[loc] = {
      x: cellX,
      y: cellY,
    }
  }

  lastUpdated = loc;

  draw();
}

function updateLife() {
  // next gen of cells
  let nextGen = {};
  // neighbors
  let couldChange = {};

  let numCellsW = Math.ceil(canvas.width / cDiv);
  let numCellsH = Math.ceil(canvas.height / cDiv);

  for (loc in cells) {
    neighborhood.forEach((val) => {
      nX = (val[0] + cells[loc].x) % numCellsW;
      if (nX == -1)
        nX = numCellsW - 1;
      nY = (val[1] + cells[loc].y) % numCellsH;
      if (nY == -1)
        nY = numCellsH - 1;

      couldChange[`${nX},${nY}`] = {
        x: nX,
        y: nY,
        n: 0
      }
    });
  }

  for (loc in couldChange) {
    neighborhood.forEach((val) => {
      nX = (val[0] + couldChange[loc].x) % numCellsW;
      if (nX == -1)
        nX = numCellsW - 1;
      nY = (val[1] + couldChange[loc].y) % numCellsH;
      if (nY == -1)
        nY = numCellsH - 1;

      let nLoc = `${nX},${nY}`

      if (nLoc in cells) {
        couldChange[loc].n++;
      }
    });


    if (couldChange[loc].n == 3 || (couldChange[loc].n == 4 && loc in cells)) {
      nextGen[loc] = {
        x: couldChange[loc].x,
        y: couldChange[loc].y
      };
    }
  }

  cells = nextGen;
}

function update() {
  updateLife();
  draw();
}

function randomizeCells() {
  cells = {};
  let gridWidth = canvas.width / cDiv;
  let gridHeight = canvas.height / cDiv;

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      let temp = Math.random()
      if (temp >= 0.5) {
        cells[`${x},${y}`] = {
          x: x,
          y: y,
        };
      }
    }
  }
  draw();
}

function clearCells() {
  cells = {};

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
