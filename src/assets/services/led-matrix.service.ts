import { Injectable, Output, EventEmitter } from '@angular/core';

import { PerlinNoise, map } from '../classes/PerlinNoise';

import { Color } from '../classes/Color';

@Injectable({
    providedIn: null,
})

export class LEDMatrixService {
    // Comms channel lol
    public websocket: WebSocket;

    // User counter
    private users: string;

    // holds the pixel data displayed on the canvas
    private picture: number[];

    // 3600 frame to buffer information for sending a frame to the server
    private frameBuffer: number[] = new Array(3600).fill(0);

    // larger array used to store multiple frames in a 2d array to be sent to the server
    private videoCounter: number;
    private numVideoFrames: number;
    private videoBuffer: number[][];

    // used for looping perlin noise
    private noiseInterval: any;
    private noise: PerlinNoise;

    @Output() receivedState = new EventEmitter<number[]>();
    @Output() receivedUsers = new EventEmitter<string>();

    constructor() {
        this.websocket = new WebSocket("wss://smolroom.com:8001/");

        // Process received websocket data
        this.websocket.onmessage = (event: any) => {
            try {
                let data = JSON.parse(event.data);
                switch (data.type) {
                    case 'state':
                        this.picture = data.picture;
                        this.receivedState.next(this.picture);
                        break;
                    case 'users':
                        this.users = data.count.toString();
                        this.receivedUsers.next(this.users);
                        break;
                    default:
                        console.error("unsupported event", data);
                }
            } catch (err) {
                console.log("Error occurred processing message:");
                console.log(err);
                console.log(event);
            }
        };

    }

    ngOnDestroy() {
        clearInterval(this.noiseInterval);
        this.websocket.close();
    }
    
    // sends getPicture to server which in turn send the current server picture state back
    getPicture() {
        this.websocket.send(JSON.stringify({"action": "getPicture"}));
    }

    // send pixel to server
    setPixel(index: number, color: Color) {
        this.websocket.send(JSON.stringify({
            action: 'pixel',
            index: index,
            color: color.rgb.concat(0)
        }));
    }

    // Send the command to turn off all the lights
    allOff() {
        this.websocket.send(JSON.stringify({action: 'allOff'}));
        clearInterval(this.noiseInterval);
    }

    // set every pixel on the matrix to the specified color
    allOn(color: Color) {
        for(let pixel = 0; pixel < 3600; pixel ++) {
            if(pixel % 4 == 3) {
                this.frameBuffer[pixel] = color.rgb[3];
            }
        }

        this.sendFrameBuffer();
    }

    sendFrame(frame: number[]) {
        //console.log(frameBuffer);
        this.websocket.send(JSON.stringify({action: 'frame', frame: frame}));
        this.frameBuffer.fill(0);
    }

    sendCommand(command: string) {
        this.websocket.send(JSON.stringify({action: 'command', command: command}));
    }
  
    // Send frame in the frameBuffer to the server
    sendFrameBuffer() {
        this.sendFrame(this.frameBuffer);
    }

    // Send the next frame from the videoBuffer to the server
    sendNextFrameInVideoBuffer() {
        this.sendFrame(this.videoBuffer[this.videoCounter]);
        if(this.videoCounter < this.numVideoFrames) {
            this.videoCounter++;
        } else {
            this.videoCounter = 0;
        }
    }

    // Send a specific frame from the videoBuffer to the server
    sendFrameFromVideoBuffer(frameNum: number) {
        this.sendFrame(this.videoBuffer[frameNum]);
    }

    // send some noise until the button is clicked again
    sendNoise() {
        var firstOctave = 20;
        var thirdDim = 160;
        this.numVideoFrames = thirdDim + firstOctave;
        this.noise = new PerlinNoise([30, 30, thirdDim], firstOctave, 3, 1/3);

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

        clearInterval(this.noiseInterval)
        this.videoCounter = 0;
        this.noiseInterval = setInterval(() => this.sendNextFrameInVideoBuffer(), 1000/24);
    }

    // Ran when image is selected
    /*handleImgSubmit(event) {
        var img = new Image;
        img.src = URL.createObjectURL(event.target.files[0]);
        img.onload = () => {
            // get aspect ratio of the chosen img
            var imgAspectRatio = img.naturalWidth/img.naturalHeight;
            // use the aspect ration to resize the img to fit the grid, these hold the adjusted size in pixels
            var adjustedImgWidth, adjustedImgHeight;

            // depending on which dimensino of the picture is bigest, fit the img on to the canvas
            if(img.naturalWidth >= img.naturalHeight) {
                adjustedImgWidth = this.mainCanvas.nativeElement.width;
                adjustedImgHeight = Math.floor(this.mainCanvas.nativeElement.width/imgAspectRatio);
            }else{
                adjustedImgWidth = this.mainCanvas.nativeElement.height*imgAspectRatio;
                adjustedImgHeight = this.mainCanvas.nativeElement.height;
            }

            // Draw img, After Image is drawn, grab the imageData
            this.ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, adjustedImgWidth, adjustedImgHeight);
            var imgData = this.ctx.getImageData(0, 0, adjustedImgWidth, adjustedImgHeight);

            // Variables used in the following for loop
            var pictureX, pictureY, matrixX, matrixY, singleDimMatrixIndex, counter;

            // For every value in the image data
            for (var i = 0; i < imgData.data.length; i += 4) {

                // Figure out the X Y coords of the value in the image
                pictureY = Math.floor(Math.floor(i/4)/imgData.width);
                pictureX = Math.floor(i/4)%imgData.width;

                // Figure out the X Y coords of the value in the matrix
                matrixX = Math.floor(pictureX/this.squareSize);
                matrixY = Math.floor(pictureY/this.squareSize);

                // Figure out the single dimensional index of the matrix location out of 3600
                singleDimMatrixIndex = (matrixX * 30 + matrixY) * 4;

                // for each red green blue color, add the color to the corresponding red green blue of the frame buffer
                for(var j = 0; j < 3; j ++) {
                    this.frameBuffer[singleDimMatrixIndex + j] += imgData.data[i + j];
                }
                // as a counter we will then increment the unused white color spot
                this.frameBuffer[singleDimMatrixIndex + 3] ++;
            }

            // for every color in the frame buffer
            this.frameBuffer = this.frameBuffer.map((color, index) => {

                // if the index we are looking at is the white spot, return 0 as we want that color turned off
                if(index%4 == 3) {
                    return 0;
                }

                // get the counter info from the white spot of the current pixel
                var divideBy = (this.frameBuffer[index-(index%4)+3]);
                // ensure we dont run into any divide by 0 errors
                if (divideBy == 0) return 0;

                // return the original colro info divided by the counter thus creating an average of all the colors added
                // using the Math functions ensures the value being returned is between 0 and 255
                return Math.min(255, Math.max(0, Math.floor(color / divideBy)));
            });

            // Further image processing goes here, this is currently unused
            /* This turns off any pixel that was probably supposed to be black but came out kinda grey
               for(var i = 0; i < frameBuffer.length; i += 4) {
               if ((frameBuffer[i] == frameBuffer[i + 1]) && (frameBuffer[i] == frameBuffer[i + 2]) && frameBuffer[i] < 25) {
               frameBuffer[i] = frameBuffer[i + 1] = frameBuffer[i + 2] = 0;
               }
               }
        };
    }*/
}
