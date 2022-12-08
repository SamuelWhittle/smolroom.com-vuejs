importScripts('../classes/DataStructures.js', '../classes/MazeGen.js');

const { Graph, getKey } = data_structures;
const { Maze } = maze_gen;


let canvas, ctx;
let cDiv;
let xTiles, yTiles;
let wallThickness = 4;

let graph, maze, gridType;
let genType, pathfinder;

let lastUpdated = [];
let drawState;

let interval;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "toggleTask":
      //console.log("toggleTask");
      //toggleTask(event.data.state, event.data.fps);
      //step();
      instaSolve();
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
      pathfinder = event.data.pathfinder;
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
      maze.resetRenderMetadata();
      maze.hideSolved();
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
      maze.renderRect(ctx, xTiles, yTiles, cDiv);
  }
}

function instaSolve() {
  switch (pathfinder) {
    case '':
      break;
    case 'aStar':
    default:
      maze.aStarSolve(maze.start, maze.end);
  }

  maze.renderSolved = !maze.renderSolved;

  switch (gridType) {
    case 'hex':
      console.log("hexagonal maze rendering has not been implemented yet.");
      break;
    case 'rect':
    default:
      maze.renderSolvedPathRect(ctx, cDiv);
  }
}

// user requested to toggle userPath state of a node
function updateCell(x, y, buttons) {
  //console.log('updateCell', x, y, buttons);
  // calulate X anf Y relative to the grid
  let cellX = Math.floor(x / cDiv);
  let cellY = Math.floor(y / cDiv);

  if (cellX >= xTiles || cellY >= yTiles) return;

  // get the key of the node
  let loc = getKey(cellX, cellY);

  // if the user is trying to update the node they just updated, ignore.
  if (lastUpdated[lastUpdated.length - 1] === loc) return;

  // get the metadata for the requested node
  renderInfo = maze.nodes[loc].metadata.render;

  // if it was a left click
  if (buttons == 1) {
    // if there are nodes in the lastUpdated array
    if (lastUpdated.length > 0) {
      // if the user is trying to toggle a node that is not an edge of any of the previously toggled nodes, ignore.
        // this only applies to nodes changed since the user started the current interaction
        // lastUpdated will be cleared on control release.
      let isNeighbor = false;
      lastUpdated.forEach(key => {
        if(maze.nodes[key].edges.indexOf(loc) != -1) isNeighbor = true;
      });

      if (!isNeighbor)
        return;
    }

    // if the draw state for this control interaction has not yet been defined, use the userPath value of the current node to define it.
      // this is cleared on control release
    if (drawState == undefined) {
      if (renderInfo.userPath)
        drawState = 0;
      else 
        drawState = 1;
    }

    // if we are drawing, not erasing
    if (drawState) {
      // set userPath value of current node
      renderInfo.userPath = true;
      renderInfo.highlighted = false;
    } else {
      // we are erasing, not drawing
      // set userPath value of the current node
      renderInfo.userPath = false;
      renderInfo.highlighted = false;
    }
  } else if (buttons == 2) {
    if (drawState == undefined) {
      if (renderInfo.highlighted)
        drawState = 0;
      else 
        drawState = 1;
    }

    if (drawState) {
      renderInfo.highlighted = true;
    } else {
      renderInfo.highlighted = false;
    }
  }

  switch (gridType) {
    case 'hex':
      console.log("hexagonal maze rendering has not been implemented yet.");
      break;
    case 'rect':
    default:
      maze.renderNodeRect(loc, ctx, cDiv, wallThickness);
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
