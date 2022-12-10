importScripts('../classes/MazeGen.js', '../classes/MazeRenderer.js', '../classes/Pathfinder.js', '../classes/DataStructures.js');

const { DisjointSet, Graph, PriorityQueue } = data_structures;
const { Maze } = maze_gen;
const { MazeRenderer } = maze_renderer;
const { Pathfinder } = path_finder;

let canvas, ctx;
let cDiv, wallThickness;
let xTiles, yTiles;

let maze, gridType;
let mazeRenderer, genType;
let pathfinderType, pathfinder, pathfinderIter;

let lastUpdated = [];
let drawState;

let interval;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "toggleTask":
      //console.log("toggleTask");
      toggleTask(event.data.state, event.data.fps);
      //step();
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;

      init();

      break;
    case 'task':
      canvas = event.data.canvas;
      cDiv = event.data.cDiv;
      wallThickness = event.data.wallThickness;
      genType = event.data.genType;
      pathfinderType = event.data.pathfinderType;
      gridType = event.data.gridType;

      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 1;

      init();

      postMessage({ msgType: "ready" });
      break;
    case "newMaze":
      init();
      break;
    case "clearPath":
      mazeRenderer.resetRenderMetadata();
      mazeRenderer.hideSolved();
      pathfinderIter = pathfinder.getAStarSolveIter(maze.start, maze.end);
      mazeRenderer.renderMaze(ctx);
      break;
    case 'genType':
      genType = event.data.genType;
      init();
      break;
    case "cellUpdate":
      mazeRenderer.updateNode(event.data.x, event.data.y, event.data.buttons);
      break;
    case "clearLastUpdated":
      lastUpdated = [];
      drawState = undefined;
      break;
    case "terminate":
      self.close();
      break;
  }
};

postMessage({ msgType: "clockIn" });

function init() {
    initMaze();
    initMazeRenderer();
    mazeRenderer.renderMaze(ctx);
    initPathfinder();
}

function initMaze() {
    maze = new Maze();
    maze.gridType = gridType;

    switch (gridType) {
        case 'hex':
            console.log("hexagonal graph init has not yet been implemented.");
        case 'rect':
        default:
            maze.xTiles = Math.floor(canvas.width / cDiv);
            maze.yTiles = Math.floor(canvas.height / cDiv);
    }

    maze.initNodes();
    maze.initNodeNeighbors();

    maze.setStart('0.0');
    maze.setEnd(`${maze.xTiles - 1}.${maze.yTiles - 1}`);

    switch (genType) {
        case 'kruskal':
            maze.generateKruskal();
            break;
        case 'backtracker':
        default:
            maze.generateBacktracker();
            maze.sprinkle(0.01);
    }
}

function initMazeRenderer() {
    mazeRenderer = new MazeRenderer(maze);
    mazeRenderer.setSizes(cDiv, wallThickness);
}

function initPathfinder() {
  pathfinder = new Pathfinder(maze.nodes);
  pathfinderIter = pathfinder.getAStarSolveIter(maze.start, maze.end);
}

function instaSolve() {
    pathfinder.aStarSolve(maze.start, maze.end);
    maze.solvedPath = pathfinder.solvedPath;

    mazeRenderer.renderSolved = !mazeRenderer.renderSolved;

    mazeRenderer.renderSolvedPath(ctx);
}

function step() {
  //console.log(pathfinderIter.next().value);
  const state = pathfinderIter.next().value;
  if (state === undefined) {
    console.log('finished');
    toggleTask(false);
  } else if (!state.done) {
    console.log('renderYield');
    mazeRenderer.renderYield(ctx, state);
  } else if (state.done) {
    console.log('renderSolvedPath');
    maze.solvedPath = state.solvedPath;
    mazeRenderer.renderSolvedPath(ctx);
  }
}

function toggleTask(state, fps) {
  if (state) {
    setTimeInterval(fps);
  } else {
    clearTimeInterval();
  }
}

function setTimeInterval(fps) {
  clearTimeInterval();

  interval = setInterval(step, 1000 / fps);
}

function clearTimeInterval() {
  if (interval) {
    clearInterval(interval);
  }
}
