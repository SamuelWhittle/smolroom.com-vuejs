
self.onmessage = event => {
  switch (event.data.msgType) {
    case "startWaiting":
      startWaiting(event);
      break;
    case 'resizeCanvas':
      canvas.width = event.data.width;
      canvas.height = event.data.height;

      break;
    case 'task':
      canvas = event.data.canvas;
      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      cDiv = event.data.canvasDivisor;

      init();
      break;
    case "terminate":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

function init() {

}

function update() {

}
