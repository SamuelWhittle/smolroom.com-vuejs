import * as wasm from './perlin_noise_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let cachedFloat64Memory0 = new Float64Array();

function getFloat64Memory0() {
    if (cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8);
    getFloat64Memory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function getArrayF64FromWasm0(ptr, len) {
    return getFloat64Memory0().subarray(ptr / 8, ptr / 8 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
*/
export class PerlinNoise {

    static __wrap(ptr) {
        const obj = Object.create(PerlinNoise.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_perlinnoise_free(ptr);
    }
    /**
    * @param {number} num_octaves
    * @param {number} octave_scale
    * @param {bigint} seed
    * @returns {PerlinNoise}
    */
    static multi_octave_with_seed(num_octaves, octave_scale, seed) {
        const ret = wasm.perlinnoise_multi_octave_with_seed(num_octaves, octave_scale, seed);
        return PerlinNoise.__wrap(ret);
    }
    /**
    * @param {bigint} seed
    * @returns {PerlinNoise}
    */
    static single_octave_with_seed(seed) {
        const ret = wasm.perlinnoise_single_octave_with_seed(seed);
        return PerlinNoise.__wrap(ret);
    }
    /**
    * @param {number} num_octaves
    * @param {number} octave_scale
    * @returns {PerlinNoise}
    */
    static multi_octave(num_octaves, octave_scale) {
        const ret = wasm.perlinnoise_multi_octave(num_octaves, octave_scale);
        return PerlinNoise.__wrap(ret);
    }
    /**
    * @returns {PerlinNoise}
    */
    static single_octave() {
        const ret = wasm.perlinnoise_single_octave();
        return PerlinNoise.__wrap(ret);
    }
    /**
    * @param {Float64Array} positions
    * @param {number} dimensions
    * @returns {Float64Array}
    */
    get_noise_array(positions, dimensions) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(positions, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.perlinnoise_get_noise_array(retptr, this.ptr, ptr0, len0, dimensions);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Float64Array} coords
    * @returns {number}
    */
    get_fractal_noise_value(coords) {
        const ptr0 = passArrayF64ToWasm0(coords, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.perlinnoise_get_fractal_noise_value(this.ptr, ptr0, len0);
        return ret;
    }
    /**
    * @param {number} num
    * @param {number} old_min
    * @param {number} old_max
    * @param {number} new_min
    * @param {number} new_max
    * @returns {number}
    */
    static range_map(num, old_min, old_max, new_min, new_max) {
        const ret = wasm.perlinnoise_range_map(num, old_min, old_max, new_min, new_max);
        return ret;
    }
    /**
    * @returns {number}
    */
    get_num_octaves() {
        const ret = wasm.perlinnoise_get_num_octaves(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get_octave_scale() {
        const ret = wasm.perlinnoise_get_octave_scale(this.ptr);
        return ret;
    }
    /**
    * @returns {bigint}
    */
    get_seed() {
        const ret = wasm.perlinnoise_get_seed(this.ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {number} num_octaves
    */
    set_num_octaves(num_octaves) {
        wasm.perlinnoise_set_num_octaves(this.ptr, num_octaves);
    }
    /**
    * @param {number} octave_scale
    */
    set_octave_scale(octave_scale) {
        wasm.perlinnoise_set_octave_scale(this.ptr, octave_scale);
    }
    /**
    * @param {bigint} new_seed
    */
    set_seed(new_seed) {
        wasm.perlinnoise_set_seed(this.ptr, new_seed);
    }
}

export function __wbg_randomFillSync_065afffde01daa66() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_getRandomValues_b99eec4244a475bb() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_process_0cc2ada8524d6f83(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_versions_c11acceab27a6c87(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_7ff1ce49caf23815(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_static_accessor_NODE_MODULE_cf6401cc1091279e() {
    const ret = module;
    return addHeapObject(ret);
};

export function __wbg_require_a746e79b322b9336() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_2036bed7c44c25e7(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_msCrypto_a21fc88caf1ecdc8(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_newnoargs_b5b063fc6c2f0376(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_97ae9d8645dc388b() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_self_6d479506f72c6a71() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_f2557cc78490aceb() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_7f206bda628d5286() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_ba75c50d1cf384f4() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_buffer_3f3d764d4747d564(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_8c3f0052272a457a(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_83db9690f9353e79(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_9e1ae1900cb0fbd5(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_f5933855e4f48a19(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_58ad4efbb5bcb886(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

