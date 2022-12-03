importScripts('../classes/graph.js', '../classes/mazeGen.js');

const { Maze } = maze_gen;
const { Graph, getKey } = _graph;

let canvas, ctx;
let cDiv;
let xTiles, yTiles;

let graph, maze, gridType;

let interval;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "toggleTask":
      console.log("toggleTask");
      //toggleTask(event.data.state, event.data.fps);
      step();
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;

      initGrid();
      init();

      break;
    case 'task':
      canvas = event.data.canvas;
      cDiv = event.data.cDiv;
      gridType = event.data.gridType;

      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 1;

      initGrid();
      init();

      postMessage({ msgType: "ready" });
      break;
    case "newMaze":
      init();
      break;
    case "clearPath":
      maze.render();
      break;
    case "terminate":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

postMessage({ msgType: "clockIn" });

function initGrid() {
  switch (gridType) {
    case 'hex':
      break;
    case 'rect':
    default:
      xTiles = Math.floor(canvas.width / cDiv);
      yTiles = Math.floor(canvas.height / cDiv);
  }
}

function init() {
  initGraph();
  newMaze();
}

function initGraph() {
  graph = new Graph();

  switch (gridType) {
    case 'hex':
      console.log("hexagonal graph init has not yet been implemented.");
    case 'rect':
    default:
      graph.initMazeNodes(xTiles, yTiles);
  }
}

function newMaze() {
  const start = getKey(0, 0);
  const end = getKey(xTiles - 1, yTiles - 1);

  const nodes = graph.Nodes;

  maze = new Maze(nodes);
  maze.setStart(start);
  maze.setEnd(end);
  maze.generateRB(start);
  maze.sprinkle(0.01);
  maze.render({ gridType: gridType, ctx: ctx, xTiles: xTiles, yTiles: yTiles, cDiv: cDiv });
}

function step() {

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
