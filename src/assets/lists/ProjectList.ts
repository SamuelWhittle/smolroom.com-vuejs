import type { Project } from '@/assets/types';

export const PROJECTLIST: Project[] = [
    {id: 1, name: 'desat-scale', title: "Desaturation Scale", description: 'Choose a color via RGB sliders to see a desaturation scale generated. The Vertical axis defines white content, and the horizontal scale defines a color value ranging between your selected color and the chromatic opposite.', previewType: 'imgTemplate'},
    {id: 2, name: 'perlin-noise', title: "Basic Perlin Noise", description: '', previewType: 'imgTemplate'},
    {id: 3, name: 'led-matrix', title: "LED Matrix Control", description: '', previewType: 'ledMatrixTemplate'},
    {id: 4, name: 'circumcenter', title: "Circumcenter Visual", description: '', previewType: 'imgTemplate'},
    {id: 5, name: 'perlin-noise1', title: "Perlin Noise Grass", description: '', previewType: 'imgTemplate'},
]
