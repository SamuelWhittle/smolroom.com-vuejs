<template>
  <div class="grid vertical-center" :style="gridStyle" v-longpress="toggleControls" v-on="interactive ? { mousedown: mousedown, mousemove: mousemove, contextmenu: contextmenu,
    touchstart: processTouchstart, touchmove: processTouchmove } : {}">
    <div v-for="color in colors" :key="color.id" :id="color.id" :style="{ 'background-color': color.getRGBString() }"></div>
    <div class="controls flex flex-dir-column flex-justify-center easy-on-the-eyes" :class="{ 'controls-visible': controlsVisible }">
        <p>Press Esc or long press on grid to toggle this menu.</p>
        <div class="controls-general flex flex-justify-center">
            <span class="users">{{ users }}</span> online
            <button type="button" id="offButton" @click="offButtonClick">Off</button>
            <input type="color" id="colorPicker" value="#42b883" style="width:25%;" @change='colorPickerNewColor'>
        </div>
        <!--<div class="controls-image flex flex-justify-center">
            <form id="upload">
                <label for="img">Select image:</label>
                <input type="file" id="input" accept="image/*" @change='handleImgSubmit'>
                <button type="button" id="sendPicture" @click='sendFrameBuffer'>Send Picture!</button>
            </form>
        </div>-->
        <div class="controls-noise flex flex-justify-center">
            <button type="button" id="sendNoiseButton" @click='sendNoise'>Send Noise Loop</button>
        </div>
    </div>
  </div>
</template>

<script>
  import { LEDMatrixClient } from '@/assets/classes/LEDMatrixClient';
  import { Color } from '@/assets/classes/Color';
  import { PerlinNoise, map } from '@/assets/classes/PerlinNoise';

  export default {
    props: {
      interactive: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        client: new LEDMatrixClient(),
        controlsVisible: false,
        gridStyle: {
          width: '0px',
          height: '0px',
          margin: 'auto'
        }
      }
    },
    watch: {
      connected: {
        handler(connected) {
          if (connected && this.interactive) {
            this.initControls();
          }
          this.client.getPicture();
        },
      },
    },
    computed: {
      users() {
        return this.client.userCount;
      },
      colors() {
        return this.client.colors;
      },
      connected() {
        return this.client.connected;
      },
    },
    created() {
      this.client.init();
    },
    beforeUnmount() {
      this.client.disconnect();
    },
    mounted() {
      this.currentColor = new Color(0x42, 0xb8, 0x83);
      this.drawingColor = new Color();

      
      this.parentResizeObserver = new ResizeObserver(() => {
        this.setGridSize();
      });

      this.parentResizeObserver.observe(this.$el.parentNode);
    },
    beforeUnmount() {
      if (this.parentResizeObserver) {
        this.parentResizeObserver.disconnect();
      }
    },
    methods: {
      setGridSize() {
        let parentWidth = this.$el.parentNode.clientWidth;
        let parentHeight = this.$el.parentNode.clientHeight;

        if (parentWidth > parentHeight) {
          this.gridStyle.width = `${parentHeight}px`;
          this.gridStyle.height = `${parentHeight}px`;
        } else {
          this.gridStyle.width = `${parentWidth}px`;
          this.gridStyle.height = `${parentWidth}px`;
        }
      },
      // Send the next frame from the videoBuffer to the server
      sendNextFrameInVideoBuffer() {
        this.client.sendFrame(this.videoBuffer[this.videoCounter]);
        if(this.videoCounter < this.numVideoFrames) {
            this.videoCounter++;
        } else {
            this.videoCounter = 0;
        }
      },
      // send some noise until the button is clicked again
      sendNoise() {
        this.videoBuffer = new Array(this.numVideoFrames);

        for (let i = 0; i < this.videoBuffer.length; i++) {
            this.videoBuffer[i] = new Array(3600).fill(0);
        }
        //console.log(videoBuffer);

        for(var i = 0; i < this.numVideoFrames; i ++) {
            for(var x = 0; x < 30; x++) {
                for(var y = 0; y < 30; y++) {
                    var noiseValue = map(this.noise.getNoisePixel([x, y, i]), -1, 1, 0, 1);

                    var color = new Color().HSVtoRGB(noiseValue, 1, 0.2);

                    this.videoBuffer[i][((x * 30 + y) * 4)] = color.r;
                    this.videoBuffer[i][((x * 30 + y) * 4) + 1] = color.g;
                    this.videoBuffer[i][((x * 30 + y) * 4) + 2] = color.b;
                }
            }
        }

        clearInterval(this.noiseInterval);
        this.videoCounter = 0;
        this.noiseInterval = setInterval(() => this.sendNextFrameInVideoBuffer(), 1000/24);
      },
      initControls() {
        if (this.$cookies.isKey("controlsVisible")) {
          //this.controlsVisible = true;
          this.controlsVisible = this.$cookies.get("controlsVisible") === 'true';
        } else {
          this.toggleControls();
        }

        // are they clicking?
        this.mouseIsDown = false;
        // Did they start long pressing whilst in the menu
        this.pressStartedInMenu = false;

        // larger array used to store multiple frames in a 2d array to be sent to the server
        this.videoCounter = 0;
        this.numVideoFrames= 0;
        this.videoBuffer = [];
        // noise
        this.firstOctave = 20;
        this.thirdDim = 160;

        this.numVideoFrames = this.thirdDim + this.firstOctave;
        this.noise = new PerlinNoise([30, 30, this.numVideoFrames], this.firstOctave, 3, 1/3);
        this.noiseInterval = 0;

        this.keyStrokes = "";

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
          }
        });
        window.addEventListener('keypress', (event) => {
          switch(event.key) {
            case "Enter":
              this.processKeyStrokes();
              break;
            default:
              this.keyStrokes += event.key;
              break;
          }
        });
      },
      //Toggle controls visibility
      toggleControls() {
        if (this.interactive) {
          this.controlsVisible = !this.controlsVisible;
          this.$cookies.set("controlsVisible",`${this.controlsVisible}`);
          //document.cookie = `controlsVisible=${this.controlsVisible}; SameSite=Strict`;
        }
      },
      offButtonClick() {
        clearInterval(this.noiseInterval);
        this.client.allOff();
      },
      colorPickerNewColor(event) {
        let tempColor = new Color();
        let tempRgbArray = tempColor.hexToRgbArray(event.srcElement.value);
        this.currentColor = new Color(...tempRgbArray);
        this.toggleControls();
      },
      // mouse down
      mousedown(event) {
        this.mouseIsDown = true;
        if(this.controlsVisible) {
            this.pressStartedInMenu = true;
        }
        this.canvasDrag(event);
      },
      // mouse move
      mousemove(event) {
        if (this.mouseIsDown) {
            this.canvasDrag(event);
        }
      },
      // mouse up
      mouseup() {
        this.mouseIsDown = false;
        this.pressStartedInMenu = false;
      },
      // touch start
      processTouchstart(event) {
        //event.preventDefault();

        /*for (let i = 0; i < event.targetTouches.length; i++) {
            this.tpCache.push(event.targetTouches[i]);
        }*/

        switch (event.targetTouches.length) {
            case 1:
                this.handleOneTouch(event); break;
            case 2:
                this.handleTwoTouches(event); break;
            default:
                this.gestureNotSupported(event); break;
        }
      },
      handleOneTouch(event) {
        var touch = event.touches[0];

        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.pageX,
            clientY: touch.pageY,
            buttons: 1
        });

        this.mousedown(mouseEvent);
      },
      handleTwoTouches() {
        console.log("Handle two touches.");
      },
      gestureNotSupported() {
        console.log("Unsupported Gesture");
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

        this.canvasDrag(mouseEvent);
      },
      // Block the default right click behavior
      contextmenu(event) {
        event.preventDefault();
      },
      // get mouse location and change colors accordingly
      canvasDrag(event) {
        if(this.pressStartedInMenu) {
          return;
        }

        if (event.buttons === 1) {
          this.drawingColor.update(this.currentColor);
        } else if (event.buttons === 2) {
          this.drawingColor.update(new Color(0,0,0));
        } else {
          return;
        }

        let selectedDiv = document.elementFromPoint(event.clientX, event.clientY);
            
        if (selectedDiv.id.length > 0) {
          if (this.colors[selectedDiv.id].rgb[0] == this.drawingColor.rgb[0] &&
            this.colors[selectedDiv.id].rgb[1] == this.drawingColor.rgb[1] &&
            this.colors[selectedDiv.id].rgb[2] == this.drawingColor.rgb[2] &&
            this.colors[selectedDiv.id].rgb[3] == this.drawingColor.rgb[3]) return;
        
          this.client.setPixel(selectedDiv.id, this.drawingColor);
        }    
      },
      // process keystroke history for valid commands
      processKeyStrokes() {
        this.client.sendCommand(this.keyStrokes);
        
        this.keyStrokes = "";
      },
    },
  }
</script>

<style scoped src="@/assets/css/components/led-matrix-display.css"></style>
