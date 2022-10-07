export class Triangle {
  coords: number[][] = new Array(3).fill(new Array(2).fill(0));
  slopes: number[] = new Array(3).fill(0);
  bisectPoints: number[][] = new Array(3).fill(new Array(2).fill(0));
  // colors[Side 1, Side 2, Side 3, points, circumcenter]
  colors: string[] = ['#FF3030', '#50FF50', '#0090FF', '#FFFFFF', '#FF9000'];


  constructor();
  constructor(pointA: number[], pointB: number[], pointC: number[]);
  constructor(pointA?: number[], pointB?: number[], pointC?: number[]) {
    this.coords[0] = pointA ?? [0, 0];
    this.coords[1] = pointB ?? [0, 0];
    this.coords[2] = pointC ?? [0, 0];
  }

  update(pointA: number[], pointB: number[], pointC: number[]) {
    this.coords[0] = pointA;
    this.coords[1] = pointB;
    this.coords[2] = pointC;
  }

  drawCircumcenter(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.colors[3];
    // Draw the Points
    this.coords.map((point) => {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI)
      ctx.fill();
      ctx.closePath();
    });

    // Draw the triangle
    this.coords.forEach((_, index) => {
      ctx.beginPath();
      ctx.strokeStyle = this.colors[index];
      ctx.moveTo(this.coords[index][0], this.coords[index][1]);
      ctx.lineTo(this.coords[(index + 1) % 3][0], this.coords[(index + 1) % 3][1]);
      ctx.stroke();
      ctx.closePath();
    });

    // Draw the bisecting perpendicular lines
    // Get Slopes of triangle sides
    this.slopes[0] = (this.coords[1][1] - this.coords[0][1]) / (this.coords[1][0] - this.coords[0][0]);
    this.slopes[1] = (this.coords[2][1] - this.coords[1][1]) / (this.coords[2][0] - this.coords[1][0]);
    this.slopes[2] = (this.coords[0][1] - this.coords[2][1]) / (this.coords[0][0] - this.coords[2][0]);

    // Get bisect points of triangle sides
    this.bisectPoints = this.coords.map((_, pointIndex) => {
      let deltaX, deltaY;
      if(pointIndex < this.coords.length - 1) {
        deltaX = this.coords[pointIndex + 1][0] - this.coords[pointIndex][0];
        deltaY = this.coords[pointIndex + 1][1] - this.coords[pointIndex][1];
      } else {
        deltaX = this.coords[0][0] - this.coords[pointIndex][0];
        deltaY = this.coords[0][1] - this.coords[pointIndex][1];
      }

      return [this.coords[pointIndex][0] + deltaX / 2, this.coords[pointIndex][1] + deltaY / 2];
    });

    // Draw perpendicular lines that bisect the triangle sides
    this.bisectPoints.map((bisectPoint, bPIndex) => {
      this.drawNormalLine(bisectPoint[0], bisectPoint[1], this.slopes[bPIndex], canvasWidth, canvasHeight, ctx, this.colors[bPIndex]);
    });



    // Draw the circle x, x1, y1, m, x2, x3, y3, m2
    let circumcenter = this.getCircumcenterPoint(
      this.bisectPoints[0][0], this.bisectPoints[0][1], -1/this.slopes[0],
      this.bisectPoints[1][0], this.bisectPoints[1][1], -1/this.slopes[1], 
      this.bisectPoints[2][0], this.bisectPoints[2][1], -1/this.slopes[2]
    );
    ctx.beginPath();
    ctx.strokeStyle = this.colors[4];
    ctx.arc(circumcenter[0], circumcenter[1], this.getDistance(circumcenter[0], circumcenter[1], this.coords[0][0], this.coords[0][1]), 0, 2*Math.PI)
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = this.colors[4];
    ctx.beginPath();
    ctx.arc(circumcenter[0], circumcenter[1], 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  drawNormalLine(x: number, y: number, m: number, canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D, color: string) {
    // y-y1=m(x-x1)
    // y = m(x-x1)+y1
    ctx.beginPath();
    ctx.strokeStyle = color;
    if(m != 0 && isFinite(m)) {
      //const f = (x1) => (-1/m)*(x-x1)+y;
      ctx.moveTo(0, this.getYOnPointSlope(x, y, -1/m, 0));
      ctx.lineTo(canvasWidth, this.getYOnPointSlope(x, y, -1/m, canvasWidth));
    } else if(m == 0 || m == -0) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    } else {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    ctx.stroke();
    ctx.closePath();
  }

  getYOnPointSlope(x: number, y: number, m: number, x1: number) {
    return y-m*(x-x1);
  }

  getXOnPointSlope(x: number, y: number, m: number, y1: number) {
    return x-(y-y1)/m;
  }

  getDistance(x: number, y: number, x1: number, y1: number) {
    return Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
  }

  getCircumcenterPoint(x1: number, y1: number, m1: number, x2: number, y2: number, m2: number, x3: number, y3: number, m3: number) {
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

  getInterceptPoint(x1: number, y1: number, m1: number, x2: number, y2: number, m2: number) { 
    let interceptX = ((m1*x1)-(m2*x2)-y1+y2)/(m1-m2);
    return [interceptX, m1 * (interceptX-x1) + y1];
  }
}
