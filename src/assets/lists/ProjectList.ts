import type { Project } from '@/assets/types'

import DesaturationScaleControl from '@/views/projects/DesaturationScaleControl.vue'
import PerlinNoiseZeroControl from '@/views/projects/PerlinNoiseZeroControl.vue'
import CircumcenterControl from '@/views/projects/CircumcenterControl.vue'
import PerlinNoiseOne from '@/components/projects/PerlinNoiseOne.vue'
import LEDMatrixControl from '@/views/projects/LEDMatrixControl.vue'
import PerlinNoiseZeroWasmControl from '@/views/projects/PerlinNoiseZeroWasmControl.vue';

import PerlinNoiseZeroWasmReadMore from '@/views/ReadMore/PerlinNoiseZeroWasmReadMore.vue'
import LEDMatrixReadMore from '@/views/ReadMore/LEDMatrixReadMore.vue'

export const PROJECTLIST: Project[] = [
    {
        id: 6,
        name: 'perlin_noise_zero_wasm',
        title: "Multithreaded WASM-Based 3D Fractal Noise",
        description: `This is a demonstration of 3D Perlin Noise, two spacial dimensions and one temporal. Behind the scenes of this project is Rust-based WASM multi-threaded to your computer's maximum hardware concurrency by default. You can adjust the concurrency to see how it affects drawing speed, which is displayed in the top left.`,
        previewType: 'img',
        readMore: true,
        component: PerlinNoiseZeroWasmControl,
        readMoreComp: PerlinNoiseZeroWasmReadMore,
    },
    {
        id: 5,
        name: 'perlin_noise_one',
        title: "Perlin Noise Based Wavy Lines",
        description: 'This Demonstration uses Multi-threaded Rust-Based WASM. One thread draws and renders the canvas, and three others calculate the noise values for angle, color, and intensity.',
        previewType: 'img',
        readMore: false,
        component: PerlinNoiseOne,
        readMoreComp: {},
    },
    {
        id: 4,
        name: 'circumcenter',
        title: "Circumcenter Visual",
        description: 'Visual demonstration of the mathmatical concept of a circumcenter and how it is calculated given a specified triangle. You can move the corners of the trianlge to see how it affects the circumcenter.',
        previewType: 'img',
        readMore: false,
        component: CircumcenterControl,
        readMoreComp: {},
    },
    {
        id: 3,
        name: 'led_matrix',
        title: "LED Matrix Control",
        description: `This control scheme is an front-end client for a Rust based websocket server that keeps track of a 30x30 grid of colors. Any number of users can draw on the grid at the same time and see changes updated in real time, you can see the active user count in the menu. The grid is also displayed on a physical LED grid in my home.`,
        previewType: 'LEDMatrixDisplay',
        readMore: true,
        component: LEDMatrixControl,
        readMoreComp: LEDMatrixReadMore,
    },
    {
        id: 2,
        name: 'perlin_noise_zero',
        title: "Basic 3D Fractal Noise",
        description: 'This is a demonstration of 3D Perlin Noise, two spacial dimensions and one temporal. Behind the scenes of this project is pure Javascript running on the main thread, when you request a high resolution of noise you will see the browser stop responding. This is because Perlin Noise is expensive and Fractal Noise is just layered Perlin Noise. If you would like to see a more modern approach to this project; See "Multithreaded WASM-Based 3D Fractal Noise" above',
        previewType: 'img',
        readMore: false,
        component: PerlinNoiseZeroControl,
        readMoreComp: {},
    },
    {
        id: 1,
        name: 'desat_scale',
        title: "Desaturation Scale",
        description: "Choose a color via RGB sliders to see a desaturation scale generated. The Vertical axis defines white content, and the horizontal scale defines a color gradient between your selected color and it's chromatic opposite.",
        previewType: 'img',
        readMore: false,
        component: DesaturationScaleControl,
        readMoreComp: {},
    },
]
