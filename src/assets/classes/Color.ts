export class Color {
    public id: string;
    public rgb: number[] = new Array(4);


    constructor();
    constructor(r: number, g: number, b: number);
    constructor(r: number, g: number, b: number, w: number);
    constructor(r: number, g: number, b: number, w: number, id: string);
	constructor(r?: number, g?: number, b?: number, w?: number, id?: string) {
        this.rgb[0] = r ?? 0;
        this.rgb[1] = g ?? 0;
        this.rgb[2] = b ?? 0;
        this.rgb[3] = w ?? 0;
        this.id = id ?? '';
	}

    update(color: Color) {
        this.rgb[0] = color.rgb[0];
        this.rgb[1] = color.rgb[1];
        this.rgb[2] = color.rgb[2];
    }

	getNegative() {
		return new Color(255 - this.rgb[0], 255 - this.rgb[1], 255 - this.rgb[2]);
	}

    getRGBString() {
        return "rgb(" + this.rgb[0] + ", " + this.rgb[1] + ", " + this.rgb[2] + ")";
    }

    // Converts {r : 0, g : 0, b : 0} to "rgb(0, 0, 0)"
    rgbObjectToCssRgb(colorObject: any) {
        return `rgb(${colorObject.r}, ${colorObject.g}, ${colorObject.b})`
    }

    // Covnerts #000000 to {r : 0, g : 0, b : 0}
    hexToRgbObject(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Covnerts #000000 to [r, g, b]
    hexToRgbArray(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    // Convert 3 values (r, g, b) into "rgb(r, g, b)" where r g and b are all integers between 0 and 255
    rgbReturn = (r, g, b) => `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;

    // hsv2rgb and rgb2hsv functions from @Adam Price on stack overflow
    // requires 0<=h,s,v<=1
    HSVtoRGB(h: any, s: number, v: number) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // requires 0<=r,g,b<=255
    // returns 0<=h,s,v<=1
    RGBtoHSV(r, g, b) {
        if (arguments.length === 1) {
            g = r.g, b = r.b, r = r.r;
        }
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
        s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }
}
