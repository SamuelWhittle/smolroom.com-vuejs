import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { PerlinNoise } from '../../../classes/PerlinNoise';
import { map } from '../../../classes/PerlinNoise';

@Component({
  selector: 'app-perlin-noise',
  templateUrl: './perlin-noise.component.html',
  styleUrls: ['./perlin-noise.component.css']
})
export class PerlinNoiseComponent implements AfterViewInit {

    // Angular DOM access creates an ElementRef
    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    @ViewChild('canvasContainer') canvasContainer: ElementRef;

    // Angular DOM access for controls
    @ViewChild('timelineSlider') timelineSlider: ElementRef;
    @ViewChild('resolutionSlider') resolutionSlider: ElementRef;
    @ViewChild('redrawButton') redrawButton: ElementRef;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.main();
    }

    // Global Variables
    private ctx: CanvasRenderingContext2D;

    private noise: PerlinNoise;
    private seed: number;
    private scale: number;

    ngAfterViewInit(): void {
        this.ctx = this.mainCanvas.nativeElement.getContext('2d');

        this.main();
    }

    smoothInterp(a, b, c){
        c = this.smoothstep2(c);
        return a*(1-c)+b*c;
    }

    //Smoothstep function that assumed a safe value is passed (saves small amount of processing power)
    smoothstep2(x){
        return x*x*(3-2*x);
    }

    //Transform a number from one range to another range
    map(num, oldMin, oldMax, min, max){
        return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
    }

    // Sets canvas size to be relative to the chrome window
    adjustCanvasSize() {
        this.mainCanvas.nativeElement.width = this.canvasContainer.nativeElement.offsetWidth;
        this.mainCanvas.nativeElement.height = this.canvasContainer.nativeElement.offsetHeight;
    }

    // Change the scale
    changeResolution() {
        this.scale = Number(this.resolutionSlider.nativeElement.value);
        this.draw();
    }

    // Change the resolution
    changeTime() {
        this.draw();
    }

    // draw the current point in time on the canvas
    draw() {
        // Make sure the canvas is the right size in pixels to match the parent div in the html
        this.adjustCanvasSize();
        //adjustDocumentSize();

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);

        for(var x = 0; x < this.mainCanvas.nativeElement.width; x += this.scale) {
            for(var y = 0; y < this.mainCanvas.nativeElement.height; y += this.scale) {
                let color = this.noise.getNoisePixel([x,y, Number(this.timelineSlider.nativeElement.value)]);
                let r, g, b;
                r = g = b = map(color, -1, 1, 0, 255);
                this.ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
                this.ctx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

    // Where the things happen
    main() {
        // Make sure canvas is the right size
        //this.adjustCanvasSize();

        this.seed = Math.floor(Math.random() * 9999999999999999);

        // perlinNoise([dim1, dim2, dim3, ..., dimN(in pixels)], gridStep, numOctaves, octaveScale])
        this.noise = new PerlinNoise([this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height, 1000], 100, 3, 1/3, this.seed);
        this.scale = Number(this.resolutionSlider.nativeElement.value);

        this.draw();
    }
}
