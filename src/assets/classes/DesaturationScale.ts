import { Color } from './Color';

export class DesaturationScale {
    // color passed in or set as the starting color and the negative
    public originalColor: Color;
    public originalNegative: Color;

    // number of visible increments between the colors on the scale
    // the scale will end up being a two dimensional grid of colors of the size below
    public width: number;
    public height: number;

    // two dim array of colors that will end up being the "width" and "height" of the variables above
    public colorArray: Color[][];

    // contructor expects a color, width, and height. these correspond to the variables defined above, with color becoming originalColor
    constructor(color: Color, w: number, h: number) {
        this.originalColor = color;
        this.originalNegative = this.originalColor.getNegative();
        this.width = w;
        this.height = h;
        
        // initialize the 2D array of colors with the proper width and height, fill with empty colors
        this.colorArray = new Array(w).fill(new Array(h).fill(new Color));

        this.desaturate();
    }

    // Change Color
    setOriginalColor(color) {
        this.originalColor = color;
        this.originalNegative = color.getNegative();
        this.desaturate();
    }

    // lerp function given a percent between 0.0 and 1.0
    lerp(start, stop, percent) {
        return (1 - percent) * start + (percent * stop);
    }

    // fill colorArray with colors
    desaturate() {
        // Reference colors to lerp between
        var blackColor = new Color(0, 0, 0);
        var whiteColor = new Color(255, 255, 255);

        // Iterate through the 1st array dimension, pass the value and index through as column and widthIndex
        this.colorArray = this.colorArray.map((column, widthIndex) => {
            // return the column array but mapped as well
            // Iterate through the 2nd array dimension (column), pass the value and index through as color and heightIndex
            return column.map((color, heightIndex) => {
                // Here, we should be interating through the whole two dimensional array of colors,
                // and at any given point will have access to the current 1st and 2nd dimension indexes and the value of the color at that point
                var color = new Color();
                for(var rgb = 0; rgb < 3; rgb++) {
                    var originalLerp = this.lerp(this.originalColor.rgb[rgb], this.originalNegative.rgb[rgb], widthIndex/this.width);

                    if(heightIndex < Math.floor(this.height/2)) {
                        color.rgb[rgb] = this.lerp(blackColor.rgb[rgb], originalLerp, heightIndex/Math.floor(this.height/2));
                    }else {
                        color.rgb[rgb] = this.lerp(originalLerp, whiteColor.rgb[rgb], heightIndex/Math.floor(this.height/2)-1);
                    }
                }
                return color;
            })
        });
    }
}
