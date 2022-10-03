import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Color } from '../../../classes/Color';
import { DesaturationScale } from '../../../classes/DesaturationScale';

@Component({
  selector: 'app-desat-scale',
  templateUrl: './desat-scale.component.html',
  styleUrls: ['./desat-scale.component.css']
})
export class DesatScaleComponent implements AfterViewInit {
    // Angular DOM access creates an ElementRef
    @ViewChild('mainCanvas') mainCanvas: ElementRef<HTMLCanvasElement>;

    // Angular DOM access for sliders
    @ViewChild('redInputLabel') redInputLabel: ElementRef;
    @ViewChild('greenInputLabel') greenInputLabel: ElementRef;
    @ViewChild('blueInputLabel') blueInputLabel: ElementRef;

    // Will be used later to store canvas context
    private ctx: CanvasRenderingContext2D;

    private gridWidth: number;
    private gridHeight: number;
    private gridThickness: number;

    private color: Color;
    //private desaturationScale: DesaturationScale;

    ngAfterViewInit(): void {
        this.ctx = this.mainCanvas.nativeElement.getContext('2d');

        this.gridWidth = 13;
        this.gridHeight = 23;
        this.gridThickness = 20;

        this.mainCanvas.nativeElement.width = this.gridWidth * this.gridThickness;
        this.mainCanvas.nativeElement.height = this.gridHeight * this.gridThickness;

        this.color = new Color(255, 128, 0);

        this.drawDesaturationScale(new DesaturationScale(this.color, this.gridWidth, this.gridHeight));
        this.setTextColor(this.color);
    }

    // draw desaturation on the canvas
    drawDesaturationScale(desatScale: DesaturationScale) {
        desatScale.colorArray.forEach((column, widthIndex) => {
            column.forEach((color, heightIndex) => {
                this.ctx.fillStyle = color.getRGBString();
                this.ctx.fillRect(
                    widthIndex*this.gridThickness, 
                    heightIndex*this.gridThickness, 
                    (widthIndex+1)*this.gridThickness, 
                    (heightIndex+1)*this.gridThickness );
            })
        });
    }

    inputProcess(colorIndex: number, valueString: string) {
        // set color and draw new scale
        this.color.rgb[colorIndex] = parseInt(valueString, 10);
        this.drawDesaturationScale(new DesaturationScale(this.color, this.gridWidth, this.gridHeight));

        // change the color of the words on the screen to match the selected color (for shits and giggles)
        this.setTextColor(this.color);
    }

    setTextColor(color: Color) {
        this.redInputLabel.nativeElement.style.color = this.color.getRGBString();
        this.greenInputLabel.nativeElement.style.color = this.color.getRGBString();
        this.blueInputLabel.nativeElement.style.color = this.color.getRGBString();
    }
}
