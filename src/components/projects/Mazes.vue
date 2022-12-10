<template>
  <canvas id="mainCanvas" class="main-canvas" v-longpress="toggleControls"
    v-on="interactive ? { mousedown: mousedown, mousemove: mousemove, contextmenu: contextmenu, touchstart: processTouchstart, touchmove: processTouchmove } : {}"></canvas>
  <div class="controls flex flex-dir-column flex-justify-center easy-on-the-eyes" v-longpress="toggleControls"
    :class="{ 'controls-visible': controlsVisible }">
    <p>Press 'Esc' or long touch to toggle this menu.</p>
    <p>Pressing the 'Enter' or 'Space' key will toggle the simulation running state.</p>
    <button @click="toggleTask" class="controls-button">Start</button>
    <button @click="clearPath" class="controls-button"><u>C</u>lear</button>
    <button @click="newMaze" class="controls-button"><u>R</u>andomize</button>
    <div class="flex flex-justify-center flex-wrap">
      <div class="flex flex-dir-column">
        <p>Maze Gen Algorithm:</p>
        <div class="flex">
          <input type="radio" name="genType" id="backtracker" value="backtracker" checked="checked" v-model="genType">
          <label for="backtracker"><u>B</u>acktracker</label>
        </div>
        <div class="flex">
          <input type="radio" name="genType" id="kruskal" value="kruskal" v-model="genType">
          <label for="kruskal"><u>K</u>ruskal</label>
        </div>
      </div>
      <div class="flex flex-dir-column">
        <p>Pathfinding Algorithm:</p>
        <div class="flex">
          <input type="radio" name="pathfinderType" id="a-star" value="a-star" checked="checked"
            v-model="pathfinderType">
          <label for="a-star">A*</label>
        </div>
        <div class="flex">
          <input type="radio" name="pathfinderType" id="greedy" value="greedy" v-model="pathfinderType">
          <label for="greedy">Greedy Search</label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/css/components/canvas-and-controls.css">

</style>

<script>
export default {
  props: {
    interactive: {
      type: Boolean,
      required: true,
    },
    canvasDivisor: {
      type: Number,
      default: 30,
    },
    randomStart: {
      type: Boolean,
      default: true,
    },
    fps: {
      type: Number,
      default: 24
    }
  },
  data() {
    return {
      initializing: false,
      message: "Initializing...",
      controlsVisible: false,
      genType: 'backtracker',
      pathfinderType: 'a-star',
    }
  },
  watch: {
    initializing: {
      handler() {
        //console.log(this.initializing);
        if (!this.initializing) {
          this.postInit();
        }
      }
    },
  },
  mounted() {
    this.canvas = document.getElementById('mainCanvas');
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = this.canvas.parentNode.clientHeight;

    this.offscreenCanvas = this.canvas.transferControlToOffscreen();

    this.running = false;
    //this.mouseIsDown = false;

    this.init();
  },
  unmounted() {
    this.unwatch();
  },
  methods: {
    init() {
      if (this.initializing) return;

      this.initializing = true;

      this.terminateManager();

      this.running = false;

      this.manager = new Worker('/workers/MazesManager.js');
      this.manager.onmessage = (event) => {
        switch (event.data.msgType) {
          case 'clockIn':
            //console.log(this.genType, this.pathfinderType);
            this.manager.postMessage({
              msgType: "task",
              canvas: this.offscreenCanvas,
              cDiv: this.canvasDivisor,
              wallThickness: 4,
              gridType: 'rect',
              genType: this.genType,
              pathfinderType: this.pathfinderType,
              randomStart: this.randomStart,
            }, [this.offscreenCanvas]);
            break;
          case 'ready':
            this.initializing = false;
            break;
        }
      };
    },
    initControls() {
      if (this.$cookies.isKey("smol-controls-mazes")) {
        let cookieSettings;
        try {
          cookieSettings = this.$cookies.get("smol-controls-mazes");

          this.controlsVisible = cookieSettings.controlsVisible;
          this.genType = cookieSettings.genType;
          this.pathfinderType = cookieSettings.pathfinderType;
        } catch (err) {
          console.error(err);
        }
      } else {
        this.toggleControls();
      }

      // are they clicking?
      this.mouseIsDown = false;
      this.shifting = false;
      // Did they start long pressing whilst in the menu
      this.pressStartedInMenu = false;

      window.addEventListener('mouseup', () => {
        //console.log("mouseup");
        this.mouseup();
      });
      window.addEventListener('touchend', () => {
        //console.log('touchend');
        this.mouseup();
      });
      window.addEventListener('keydown', (event) => {
        switch (event.key) {
          case "Escape":
            //console.log("Esc");
            this.toggleControls();
            break;
          case 'c':
            this.clearPath();
            break;
          case 'r':
            this.newMaze();
            break;
          case 'k':
            this.genType = 'kruskal';
            break;
          case 'b':
            this.genType = 'backtracker';
            break;
          case " ":
          case "Enter":
            event.preventDefault();
            //console.log("Enter");
            this.toggleTask();
            break;
          case "Shift":
            this.shifting = true;
            break;
        }
      });
      window.addEventListener('keyup', (event) => {
        switch (event.key) {
          case "Shift":
            this.shifting = false;
            break;
        }
      });
    },
    postInit() {
      this.initWatchers();
      this.initControls();
    },
    newMaze() {
      this.manager.postMessage({ msgType: "newMaze" });
    },
    clearPath() {
      this.manager.postMessage({ msgType: "clearPath" });
    },
    startButton() {
      this.toggleControls();
      this.toggleTask();
    },
    toggleControls() {
      if (this.interactive) {
        this.controlsVisible = !this.controlsVisible;
        //this.$cookies.set("smol-controls-mazes", `${this.controlsVisible}`);
        this.saveSettings();

        if (this.running) {
          this.toggleTask();
        }
      }
    },
    saveSettings() {
      this.$cookies.set("smol-controls-mazes", {
        controlsVisible: this.controlsVisible,
        genType: this.genType,
        pathfinder: this.pathfinder
      });
    },
    toggleTask() {
      this.running = !this.running;

      if (this.running) {
        this.controlsVisible = false;
      }

      this.manager.postMessage({ msgType: "toggleTask", state: this.running, fps: this.fps });
    },
    initWatchers() {
      this.parentResizeObserver = new ResizeObserver(() => {
        this.manager.postMessage({ msgType: "resizeCanvas", width: this.canvas.parentNode.clientWidth, height: this.canvas.parentNode.clientHeight });
      });

      this.parentResizeObserver.observe(this.canvas.parentNode);


      this.genTypeWatcher = this.$watch('genType', () => {
        this.manager.postMessage({ msgType: 'genType', genType: this.genType });
        this.saveSettings();
      })
      this.pathfinderTypeWatcher = this.$watch('pathfinderType', () => {
        this.manager.postMessage({ msgType: 'pathfinderType', pathfinderType: this.pathfinderType });
        this.saveSettings();
      })
    },
    unwatch() {
      if (this.parentResizeObserver) {
        this.parentResizeObserver.disconnect();
      }

      if (this.genTypeWatcher) {
        this.genTypeWatcher();
        this.genTypeWatcher = null;
      }

      if (this.pathfinderTypeWatcher) {
        this.pathfinderTypeWatcher();
        this.pathfinderTypeWatcher = null;
      }
    },
    terminateManager() {
      if (this.manager) {
        this.manager.postMessage({ msgType: "terminate" });
      }
    },
    mousedown(event) {
      event.preventDefault();
      //console.log("mousedown(event)");
      //if (event.buttons == 1) {
      this.mouseIsDown = true;
      //console.log("mousedown");

      /*if (this.running) {
        this.toggleTask();
      }*/

      this.updateCell(event);
      //}
    },
    updateCell(event) {
      //console.log("updateCell(event)");
      this.manager.postMessage({
        msgType: "cellUpdate",
        x: event.clientX,
        y: event.clientY,
        buttons: this.shifting ? 2 : event.buttons
        //buttons: event.buttons
      });
    },
    // mouse move
    mousemove(event) {
      if (this.mouseIsDown) {
        //console.log("mousemove(event) while mouseIsDown");

        this.updateCell(event);
      }
    },
    // mouse up
    mouseup() {
      //console.log("mouseup()");
      this.mouseIsDown = false;
      this.manager.postMessage({ msgType: 'clearLastUpdated' });
      //console.log("mouseup");
    },
    // touch start
    processTouchstart(event) {
      //console.log("processTouchstart(event)");
      event.preventDefault();

      this.mouseIsDown = true;

      if (this.running) {
        this.toggleTask();
      }

      let touch = event.touches[0];

      let mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.pageX,
        clientY: touch.pageY,
        buttons: 1
      });

      this.updateCell(mouseEvent);
    },
    // touch move
    processTouchmove(event) {
      //console.log("processTouchmove(event)");
      event.preventDefault();

      if (this.mouseIsDown) {
        let touch = event.touches[0];

        let mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.pageX,
          clientY: touch.pageY,
          buttons: 1
        });

        this.updateCell(mouseEvent);
      }
    },
    // Block the default right click behavior
    contextmenu(event) {
      event.preventDefault();
    },
  }
}
</script>
