<template>
  <div class="grid" v-longpress="toggleControls" v-on="interactive ? { mousedown: mousedown, mousemove: mousemove, contextmenu: contextmenu,
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
      fps: {
        type: Number,
        default: 10
      }
    },
    data() {
      return {
        client: new LEDMatrixClient(),
        controlsVisible: false,
      }
    },
    watch: {
      connected: {
        handler(newVal) {
          if (newVal && !this.interactive) {
            this.updateInterval = setInterval(() => {
              this.client.getPicture();
            }, 1000/this.fps);
          } else if (newVal) {
            this.client.getPicture();
            this.initControls();
          }  
          this.client.stopInterval(this.client.updateInterval);
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
    methods: {
      getCookieValue(name) {
        return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
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
        this.controlsCookie = this.getCookieValue('controlsVisible');
        if (this.controlsCookie === '') {
          this.controlsVisible = true;
        } else {
          this.controlsVisible = (this.controlsCookie === 'true');
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
          document.cookie = `controlsVisible=${this.controlsVisible}; SameSite=Strict`;
        }
      },
      offButtonClick() {
        clearInterval(this.noiseInterval);
        this.client.allOff();
      },
      colorPickerNewColor(event) {
        let tempColor = new Color();
        let tempRgbArray = tempColor.hexToRgbArray(event.srcElement.value);
        this.client.currentColor.update(new Color(...tempRgbArray));
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
        if(!this.pressStartedInMenu) {
          let selectedDiv = document.elementFromPoint(event.clientX, event.clientY);
            
          if (selectedDiv.id.length > 0) {
            this.client.setPixel(selectedDiv.id, (event.buttons === 1) ? this.client.currentColor : new Color(0, 0, 0));
          }
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
