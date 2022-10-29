declare namespace wasm_bindgen {
	/* tslint:disable */
	/* eslint-disable */
	/**
	* @param {number} num
	* @param {number} old_min
	* @param {number} old_max
	* @param {number} new_min
	* @param {number} new_max
	* @returns {number}
	*/
	export function range_map(num: number, old_min: number, old_max: number, new_min: number, new_max: number): number;
	/**
	*/
	export class PerlinNoise {
	  free(): void;
	/**
	* @param {number} num_octaves
	* @param {number} octave_scale
	* @param {bigint} seed
	* @returns {PerlinNoise}
	*/
	  static multi_octave_with_seed(num_octaves: number, octave_scale: number, seed: bigint): PerlinNoise;
	/**
	* @param {bigint} seed
	* @returns {PerlinNoise}
	*/
	  static single_octave_with_seed(seed: bigint): PerlinNoise;
	/**
	* @param {number} num_octaves
	* @param {number} octave_scale
	* @returns {PerlinNoise}
	*/
	  static multi_octave(num_octaves: number, octave_scale: number): PerlinNoise;
	/**
	* @returns {PerlinNoise}
	*/
	  static single_octave(): PerlinNoise;
	/**
	* @param {Float64Array} positions
	* @param {number} dimensions
	* @returns {Float64Array}
	*/
	  get_noise_array(positions: Float64Array, dimensions: number): Float64Array;
	/**
	* @param {Float64Array} coords
	* @returns {number}
	*/
	  get_fractal_noise_value(coords: Float64Array): number;
	/**
	* @returns {number}
	*/
	  get_num_octaves(): number;
	/**
	* @returns {number}
	*/
	  get_octave_scale(): number;
	/**
	* @returns {bigint}
	*/
	  get_seed(): bigint;
	/**
	* @param {number} num_octaves
	*/
	  set_num_octaves(num_octaves: number): void;
	/**
	* @param {number} octave_scale
	*/
	  set_octave_scale(octave_scale: number): void;
	/**
	* @param {bigint} new_seed
	*/
	  set_seed(new_seed: bigint): void;
	}
	
}

declare type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

declare interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_perlinnoise_free: (a: number) => void;
  readonly perlinnoise_multi_octave_with_seed: (a: number, b: number, c: number) => number;
  readonly perlinnoise_single_octave_with_seed: (a: number) => number;
  readonly perlinnoise_multi_octave: (a: number, b: number) => number;
  readonly perlinnoise_single_octave: () => number;
  readonly perlinnoise_get_noise_array: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly perlinnoise_get_fractal_noise_value: (a: number, b: number, c: number) => number;
  readonly perlinnoise_get_num_octaves: (a: number) => number;
  readonly perlinnoise_get_octave_scale: (a: number) => number;
  readonly perlinnoise_get_seed: (a: number) => number;
  readonly perlinnoise_set_num_octaves: (a: number, b: number) => void;
  readonly perlinnoise_set_octave_scale: (a: number, b: number) => void;
  readonly perlinnoise_set_seed: (a: number, b: number) => void;
  readonly range_map: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
declare function wasm_bindgen (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
