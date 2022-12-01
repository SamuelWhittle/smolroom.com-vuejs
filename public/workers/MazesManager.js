importScripts('../classes/maze.js');

let canvas, ctx;
let cDiv;

let interval;

self.onmessage = event => {
  switch (event.data.msgType) {
    case "toggleTask":
      //toggleTask(event.data.state, event.data.fps);
      step();
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;
      //TODO?
      break;
    case 'task':
      canvas = event.data.canvas;
      cDiv = event.data.cDiv;

      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 1;

      //TODO

      postMessage({ msgType: "ready" });
      break;
    case "newMaze":
      //TODO
      break;
    case "clearPath":
      //TODO
      break;
    case "terminate":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

postMessage({ msgType: "clockIn" });

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
