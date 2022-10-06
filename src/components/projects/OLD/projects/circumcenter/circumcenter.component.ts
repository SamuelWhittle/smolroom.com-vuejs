import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-circumcenter',
  templateUrl: './circumcenter.component.html',
  styleUrls: ['./circumcenter.component.css']
})
export class CircumcenterComponent implements AfterViewInit {

    // Angular DOM access creates an ElementRef
    @ViewChild('mainCanvas') mainCanvas: ElementRef;
    //@ViewChild('canvasContainer') canvasContainer: ElementRef;

    @HostListener('window:resize', ['$event']) onResize(event) {
        this.adjustCanvasSize();
        this.updateCanvas();
    }

    @HostListener('window:mouseup', ['$event']) onMouseUp(event) {
        this.mouseDown = false;
    }

    // Global Variables
    private ctx: CanvasRenderingContext2D;

    private triangle: number[][] = new Array(3).fill(new Array(2).fill(0));
    private bisectPoints: number[][] = new Array(3).fill(new Array(2).fill(0));
    private b: number[] = new Array(3).fill(0);
    private slopes: number[] = new Array(3).fill(0);
    private perpSlopes: number[] = new Array(3).fill(0);

    private mouseDown: boolean = false;

    private pointInHand: number = 0;

    ngAfterViewInit(): void {
        this.ctx = this.mainCanvas.nativeElement.getContext('2d');

        this.ctx.strokeStyle = '#FFFFFF';
        this.adjustCanvasSize();
        this.triangle[0] = [this.getRandomInt(this.mainCanvas.nativeElement.width-10) + 5, this.getRandomInt(this.mainCanvas.nativeElement.height-10) + 5];
        this.triangle[1] = [this.getRandomInt(this.mainCanvas.nativeElement.width-10) + 5, this.getRandomInt(this.mainCanvas.nativeElement.height-10) + 5];
        this.triangle[2] = [this.getRandomInt(this.mainCanvas.nativeElement.width-10) + 5, this.getRandomInt(this.mainCanvas.nativeElement.height-10) + 5];
        this.updateCanvas();
        
    }

    mousedownReceived(event: any) {
        if(event.buttons == 1) {
            this.mouseDown = true;
            this.pickUpPoint(event);
            this.updateTriangle(event);
            this.updateCanvas();
        }
    }

    mousemoveReceived(event: any) {
        if(this.mouseDown) {
            this.updateTriangle(event);
            this.updateCanvas();
        }
    }

    updateCanvas() {
        // Make sure canvas resolution matches window inner resolution
        this.ctx.fillStyle = '#16161d';
        this.ctx.fillRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
        this.ctx.fillStyle = '#FFFFFF';

        // Draw the thing
        this.drawCircumcenter(this.triangle);
    }

    adjustCanvasSize() {
        this.mainCanvas.nativeElement.width = this.mainCanvas.nativeElement.offsetWidth;
        this.mainCanvas.nativeElement.height = this.mainCanvas.nativeElement.offsetHeight;
    }

    drawCircumcenter(triToDraw) {
        this.ctx.strokeStyle = '#FFFFFF';
        // Draw the Points
        triToDraw.map((point) => {
            this.ctx.beginPath();
            this.ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI)
            this.ctx.fill();
        });

        // Draw the triangle
        this.ctx.beginPath();
        this.ctx.moveTo(triToDraw[0][0], triToDraw[0][1]);
        this.ctx.lineTo(triToDraw[1][0], triToDraw[1][1]);
        this.ctx.lineTo(triToDraw[2][0], triToDraw[2][1]);
        this.ctx.lineTo(triToDraw[0][0], triToDraw[0][1]);
        this.ctx.stroke();

        // Draw the bisecting perpendicular lines
        // Get Slopes of triangle sides
        this.slopes[0] = (triToDraw[1][1] - triToDraw[0][1]) / (triToDraw[1][0] - triToDraw[0][0]);
        this.slopes[1] = (triToDraw[2][1] - triToDraw[1][1]) / (triToDraw[2][0] - triToDraw[1][0]);
        this.slopes[2] = (triToDraw[0][1] - triToDraw[2][1]) / (triToDraw[0][0] - triToDraw[2][0]);

        // Get bisect points of triangle sides
        this.bisectPoints = triToDraw.map((point, pointIndex) => {
            let deltaX, deltaY;
            if(pointIndex < this.triangle.length - 1) {
                deltaX = this.triangle[pointIndex + 1][0] - this.triangle[pointIndex][0];
                deltaY = this.triangle[pointIndex + 1][1] - this.triangle[pointIndex][1];
            } else {
                deltaX = this.triangle[0][0] - this.triangle[pointIndex][0];
                deltaY = this.triangle[0][1] - this.triangle[pointIndex][1];
            }

            return [this.triangle[pointIndex][0] + deltaX / 2, this.triangle[pointIndex][1] + deltaY / 2];
        });

        // Draw perpendicular lines that bisect the triangle sides
        this.bisectPoints.map((bisectPoint, bPIndex) => {
            this.drawNormalLine(bisectPoint[0], bisectPoint[1], this.slopes[bPIndex]);
        });



        // Draw the circle x, x1, y1, m, x2, x3, y3, m2
        let circumcenter = this.getCircumcenterPoint(this.bisectPoints[0][0], this.bisectPoints[0][1], -1/this.slopes[0],
                                                        this.bisectPoints[1][0], this.bisectPoints[1][1], -1/this.slopes[1], 
                                                        this.bisectPoints[2][0], this.bisectPoints[2][1], -1/this.slopes[2]);
        this.ctx.beginPath();
        this.ctx.arc(circumcenter[0], circumcenter[1], this.getDistance(circumcenter[0], circumcenter[1], this.triangle[0][0], this.triangle[0][1]), 0, 2*Math.PI)
        this.ctx.stroke();
    }

    drawNormalLine(x, y, m) {
        // y-y1=m(x-x1)
        // y = m(x-x1)+y1
        this.ctx.beginPath();
        if(m != 0 && isFinite(m)) {
            //const f = (x1) => (-1/m)*(x-x1)+y;
            this.ctx.moveTo(0, this.getYOnPointSlope(x, y, -1/m, 0));
            this.ctx.lineTo(this.mainCanvas.nativeElement.width, this.getYOnPointSlope(x, y, -1/m, this.mainCanvas.nativeElement.width));
        } else if(m == 0 || m == -0) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.mainCanvas.nativeElement.height);
        } else {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.mainCanvas.nativeElement.width, y);
        }
        this.ctx.stroke();
    }

    getYOnPointSlope(x, y, m, x1) {
        return y-m*(x-x1);
    }

    getXOnPointSlope(x, y, m, y1) {
        return x-(y-y1)/m;
    }

    pickUpPoint(event) {
        // Get mouse position
        let mouseX = event.clientX;
        let mouseY = event.clientY;

        // create array of distances from mouse to point
        let distances = this.triangle.map((point) => {
            return this.getDistance(mouseX, mouseY, point[0], point[1]);
        });

        // get the smallest of the distances
        let smallestDistance = Math.min(...distances);

        // get the distances[] index of the smallest index
        this.pointInHand = distances.indexOf(smallestDistance);
    }

    updateTriangle(event) {
        this.triangle[this.pointInHand][0] = event.clientX;
        this.triangle[this.pointInHand][1] = event.clientY;
    }

    getDistance(x, y, x1, y1) {
        return Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
    }

    getCircumcenterPoint(x1, y1, m1, x2, y2, m2, x3, y3, m3) {
        // y=m(x - x1) + y1
        // y2=m(x2 - x3) + y3
        // assume y = y2 and return x

        if(isFinite(m1) && isFinite(m2)) {    
            return this.getInterceptPoint(x1, y1, m1, x2, y2, m2);
        } else if(!isFinite(m1)){
            return this.getInterceptPoint(x2, y2, m2, x3, y3, m3);
        }
        return this.getInterceptPoint(x1, y1, m1, x3, y3, m3);
    }

    getInterceptPoint(x1, y1, m1, x2, y2, m2) { 
        let interceptX = ((m1*x1)-(m2*x2)-y1+y2)/(m1-m2);
        return [interceptX, m1 * (interceptX-x1) + y1];
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
