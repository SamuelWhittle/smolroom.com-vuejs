importScripts('../classes/DataStructures.js', '../classes/MazeGen.js', '../classes/AStar.js');

const { Graph, getKey } = data_structures;
const { Maze } = maze_gen;
const { AStar } = a_star;


let canvas, ctx;
let cDiv;
let xTiles, yTiles;
let wallThickness = 4;

let graph, maze, gridType;

let lastUpdated = [];
let drawState;

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
      genType = event.data.genType;
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
      renderMaze();
      break;
    case 'genType':
      genType = event.data.genType;
      init();
      break;
    case "cellUpdate":
      updateCell(event.data.x, event.data.y, event.data.buttons);
      break;
    case "clearLastUpdated":
      lastUpdated = [];
      drawState = undefined;
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
  userPath = {};

  initGraph();
  initMaze();
  renderMaze();
  //initPathfinder();
}

function initGraph() {
  graph = new Graph();

  switch (gridType) {
    case 'hex':
      console.log("hexagonal graph init has not yet been implemented.");
    case 'rect':
    default:
      graph.fillRectNodes(xTiles, yTiles);
  }
}

function initMaze() {
  const start = getKey(0, 0);
  const end = getKey(xTiles - 1, yTiles - 1);

  maze = new Maze(graph.nodes);

  maze.setStart(start);
  maze.setEnd(end);

  maze.initRectNodes();

  switch (genType) {
    case 'kruskal':
      maze.generateKruskal();
      break;
    case 'backtracker':
    default:
      maze.generateBacktracker(start);
      maze.sprinkle(0.01);
  }
}

function renderMaze() {
  switch (gridType) {
    case 'hex':
      console.log("hexagonal maze rendering has not been implemented yet.");
      break;
    case 'rect':
    default:
      maze.renderRect(ctx, xTiles, yTiles, cDiv, wallThickness);
  }
}

// user requested to toggle userPath state of a node
function updateCell(x, y, buttons) {
  // calulate X anf Y relative to the grid
  let cellX = Math.floor(x / cDiv);
  let cellY = Math.floor(y / cDiv);

  // get the key of the node
  let loc = getKey(cellX, cellY);

  // get the metadata for the requested node
  metadata = graph.nodes[loc].metadata;

  // when the user updates a node it gets pushed to the lastUpdated array
  // mouseup and touchend clear the lastUpdated array



  if (buttons == 1) {
  if (lastUpdated.length > 0) {
    // if the user is trying to update the node they just updated, ignore.
      if (lastUpdated[lastUpdated.length - 1] === loc) return;

    // if the user is trying to toggle a node that is not a neighbor of any of the previously toggled neighbor, ignore.
    let isNeighbor = false;
    lastUpdated.forEach(key => {
      if(graph.nodes[key].edges.indexOf(loc) != -1) isNeighbor = true;
    });

    if (!isNeighbor)
      return;
  }
    if (drawState == undefined) {
      if (metadata.userPath)
        drawState = 0;
      else 
        drawState = 1;
    }

    if (drawState) {
      // add it to the userPath
      metadata.userPath = true;
      metadata.highlighted = false;
      ctx.fillStyle = maze.userPathColor;
    } else {
      metadata.userPath = false;
      //metadata.highlighted = false;


      if (metadata.highlighted) {
        ctx.fillStyle = maze.highlightedColor;
      } else {
        if (metadata.isStart) {
          ctx.fillStyle = maze.startColor;
        } else if (metadata.isEnd) {
          ctx.fillStyle = maze.endColor;
        } else {
          ctx.fillStyle = maze.pathColor;
        }
      }

    }
  } else if (buttons == 2) {
    if (drawState == undefined) {
      if (metadata.highlighted)
        drawState = 0;
      else 
        drawState = 1;
    }
    
    if (drawState) {
      // add it to the userPath
      metadata.highlighted = true;
      ctx.fillStyle = maze.highlightColor;
    } else {
      metadata.highlighted = false;

      if (metadata.userPath){
        ctx.fillStyle = maze.userPathColor;
      } else{
        if (metadata.isStart) {
          ctx.fillStyle = maze.startColor;
        } else if (metadata.isEnd) {
          ctx.fillStyle = maze.endColor;
        } else {
          ctx.fillStyle = maze.pathColor;
        }
      }
    }
  }

  switch (gridType) {
    case 'hex':
      console.log("hexagonal maze rendering has not been implemented yet.");
      break;
    case 'rect':
    default:
      ctx.fillRect(cellX * cDiv + wallThickness, cellY * cDiv + wallThickness, 
        cDiv - (wallThickness * 2), cDiv - (wallThickness * 2));
  }

  lastUpdated.push(loc);
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
