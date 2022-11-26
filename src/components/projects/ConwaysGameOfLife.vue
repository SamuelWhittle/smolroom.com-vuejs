<template>
  <canvas id="mainCanvas" class="main-canvas" v-longpress="toggleControls" v-on="interactive ? { mousedown: mousedown, mousemove: mousemove, contextmenu: contextmenu,
    touchstart: processTouchstart, touchmove: processTouchmove } : {}"></canvas>
  <div class="controls flex flex-dir-column flex-justify-center easy-on-the-eyes" v-longpress="toggleControls" :class="{ 'controls-visible': controlsVisible }">
    <p>Press Esc or long touch to toggle this menu.</p>
    <p>Clicking the 'Start' button or pressing the Enter key will start the simulation.</p>
    <p>Clicking the 'Clear' button or pressing 'c' on your keyboard will clear the field.</p>
    <p>Clicking the 'Randomize' button or pressing 'r' on your keyboard will randomize the field.</p>
    <button @click="randomizeCells" class="controls-button">Randomize</button>
    <button @click="clearCells" class="controls-button">Clear</button>
    <button @click="toggleTask" class="controls-button">Start</button>
  </div>
</template>

<style scoped src="@/assets/css/components/conways-game-of-life.css"></style>

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
      }
    },
    data() {
      return {
        initializing: false,
        message: "Initializing...",
        controlsVisible: false,
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

      this.init();
    },
    methods: {
      init() {
        if (this.initializing) return;
        
        this.initializing = true;

        this.terminateManager();

        this.running = false;

        this.manager = new Worker('/workers/ConwaysGameOfLifeManager.js');
        this.manager.onmessage = (event) => {
          switch (event.data.msgType) {
            case 'clockIn':
              //console.log("manager clocked in");
              this.manager.postMessage({
                msgType: "task", 
                canvas: this.offscreenCanvas,
                cDiv: this.canvasDivisor,
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
        if (this.$cookies.isKey("smol-controls-cgl")) {
          this.controlsVisible = (this.$cookies.get("smol-controls-cgl") === 'true');
        } else {
          this.toggleControls();
        }

        // are they clicking?
        this.mouseIsDown = false;
        // Did they start long pressing whilst in the menu
        this.pressStartedInMenu = false;

        window.addEventListener('mouseup', () => {
          this.mouseup();
        });
        window.addEventListener('touchend', () => {
          this.mouseup();
        });
        window.addEventListener('keyup', (event) => {
          switch(event.key) {
            case "Escape":
              //console.log("Esc");
              this.toggleControls();
              break;
            case 'c':
              this.clearCells();
              break;
            case 'r':
              this.randomizeCells();
              break;
          }
        });
        window.addEventListener('keypress', (event) => {
          switch(event.key) {
            case "Enter":
              //console.log("Enter");
              this.toggleTask();
              break;
          }
        });
      },
      postInit() {
        this.initResizeObserve();
        this.initControls();
      },
      randomizeCells() {
          this.manager.postMessage({msgType: "randomizeCells"});
      },
      clearCells() {
          this.manager.postMessage({msgType: "clearCells"});
      },
      toggleControls() {
        if (this.interactive) {
          this.controlsVisible = !this.controlsVisible;
          this.$cookies.set("smol-controls-cgl",`${this.controlsVisible}`);

          if(this.running) {
              this.toggleTask();
          }
        }
      },
      toggleTask() {
        this.running = !this.running;

        if (this.running) {
          this.controlsVisible = false;
        }

        this.manager.postMessage({ msgType: "toggleTask", state: this.running });
      },
      initResizeObserve() {
        this.parentResizeObserver = new ResizeObserver(() => {
          this.manager.postMessage({msgType: "resizeCanvas", width: this.canvas.parentNode.clientWidth, height: this.canvas.parentNode.clientHeight});
        });

        this.parentResizeObserver.observe(this.canvas.parentNode);
      },
      unwatch() {
        if (this.parentResizeObserver) {
          this.parentResizeObserver.disconnect();
        }
      },
      terminateManager() {
        if (this.manager) {
          this.manager.postMessage({ msgType: "terminate" });
        }
      },
      mousedown(event) {
        this.mouseIsDown = true;
        //console.log("mousedown");

        this.updateCell(event);
      },
      updateCell(event) {
        //console.log(Math.floor(event.clientX / this.canvasDivisor), Math.floor(event.clientY / this.canvasDivisor));
        this.manager.postMessage({
          msgType: "cellUpdate", 
          x: event.clientX, 
          y: event.clientY, 
        });
      },
      // mouse move
      mousemove(event) {
        if (this.mouseIsDown) {
          //console.log("mousemove");

          this.updateCell(event);
        }
      },
      // mouse up
      mouseup() {
        this.mouseIsDown = false;
        //console.log("mouseup");
      },
      // touch start
      processTouchstart(event) {
        var touch = event.touches[0];

        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.pageX,
            clientY: touch.pageY,
            buttons: 1
        });

        this.updateCell(mouseEvent);
      },
      // touch move
      processTouchmove(event) {
        event.preventDefault();

        var touch = event.touches[0];

        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.pageX,
            clientY: touch.pageY,
            buttons: 1
        });

        this.updateCell(mouseEvent);
      },
      // Block the default right click behavior
      contextmenu(event) {
        event.preventDefault();
      },
    }
  }
</script>
