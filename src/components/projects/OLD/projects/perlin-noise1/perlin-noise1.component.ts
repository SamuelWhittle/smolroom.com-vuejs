import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { PerlinNoise } from '../../../classes/PerlinNoise';
import { map } from '../../../classes/PerlinNoise';

@Component({
  selector: 'app-perlin-noise1',
  templateUrl: './perlin-noise1.component.html',
  styleUrls: ['./perlin-noise1.component.css']
})
export class PerlinNoise1Component implements AfterViewInit {

    // Angular DOM access creates an ElementRef
    @ViewChild('mainCanvas') mainCanvas: ElementRef<HTMLCanvasElement>;
   
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.adjustCanvasSize();
        this.calculateConstants();
    }

    // Global Variables
    // Will be used later to store canvas context
    private ctx: CanvasRenderingContext2D;

    private counter: number;
    private canvasDivisor: number;

    private dims: number[];
    
    private angleNoise: PerlinNoise;
    private colorNoise: PerlinNoise;
    private intensityNoise: PerlinNoise;

  constructor() { }

  ngAfterViewInit(): void {
        this.ctx = this.mainCanvas.nativeElement.getContext('2d');

        this.counter = 0;

        this.canvasDivisor = 40;

        this.dims = new Array(2);

        this.adjustCanvasSize();
        this.calculateConstants();
        //this.drawLines();
        setInterval(() => this.drawLines(), 1000/24);
  }

  // Custom Functions
  drawLines() {
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

      for(let x = 0; x < this.dims[0]; x ++) {
          for(let y = 0; y < this.dims[1]; y ++) {
              // All noise values will start between -1 and 1

              // Get angle noise value and adjust contraints from -1 to 0 and from 1 to Math.PI*2
              let angle = this.angleNoise.getNoisePixel([x, y, this.counter]);
              angle = map(angle, -1, 1, 0, Math.PI*2);

              // Get color noise value and adjust contraints from -1 to 150 and from 1 to 250
              let color = this.colorNoise.getNoisePixel([x, y, this.counter]);
              color = map(color, -1, 1, 150, 250);

              // Get intensity noise value
              let intensity = this.intensityNoise.getNoisePixel([x, y, this.counter]);
              // adjust intensity contraints from -1 to 0 and from 1 to 10, this is for line width
              let lineWidth = Math.floor(map(intensity, -1, 1, 0, 10));
              // adjust intensity contraints from -1 to 0 and from 1 to 150, this is for line length
              let length = Math.floor(map(intensity, -1, 1, 0, 200));
              // adjust intensity contraints from -1 to 0 and from 1 to 1, this is for line opacity
              let opacity = map(intensity, -1, 1, 0, 1);

              // set line width and color
              this.ctx.lineWidth = lineWidth;
              this.ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`

              // calculate the endpoint of the line
              let lineEndX = x * this.canvasDivisor + Math.cos(angle) * length;
              let lineEndY = y * this.canvasDivisor + Math.sin(angle) * length;

              // Draw the inital line
              this.ctx.beginPath();
              this.ctx.moveTo(x * this.canvasDivisor, y * this.canvasDivisor);
              this.ctx.lineTo(lineEndX, lineEndY);
              this.ctx.stroke();

              // Set accent color
              this.ctx.fillStyle = `hsla(${color}, 100%, 100%, ${opacity})`
              // Draw accent
              this.ctx.beginPath();
              this.ctx.arc(lineEndX, lineEndY, lineWidth/2, 0, Math.PI*2);
              this.ctx.fill();
          }
      }

      this.counter += 0.10;

      this.counter = this.counter%1001;
  }

  calculateConstants() {
      this.dims[0] = Math.ceil(this.mainCanvas.nativeElement.width / this.canvasDivisor) + 1;
      this.dims[1] = Math.ceil(this.mainCanvas.nativeElement.height / this.canvasDivisor) + 1;
      this.angleNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 10, 2, 1/2, 0);
      this.colorNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 20, 2, 1/2, 1);
      this.intensityNoise = new PerlinNoise([this.dims[0], this.dims[1], 1000], 10, 2, 1/2, 2);
  }

  adjustCanvasSize() {
      this.mainCanvas.nativeElement.width = window.innerWidth;
      this.mainCanvas.nativeElement.height = window.innerHeight;
  }
}
