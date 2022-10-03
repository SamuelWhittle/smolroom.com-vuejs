import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import * as Module from '../wasm/hello_wasm.js'
import '!!file-loader?name=wasm/hello_wasm_bg.wasm!../wasm/hello_wasm_bg.wasm'

@Injectable({
  providedIn: 'root'
})
export class WasmService {
  module: any

  wasmReady = new BehaviorSubject<boolean>(false)

  constructor() {
    this.instantiateWasm('wasm/hello_wasm_bg.wasm')
  }

  private async instantiateWasm(url: string) {
    // fetch the wasm file
    const wasmFile = await fetch(url)

    // convert it into a binary array
    const buffer = await wasmFile.arrayBuffer()
    const binary = new Uint8Array(buffer)

    // create module arguments
    // including the wasm-file
    const moduleArgs = {
      wasmBinary: binary,
      onRuntimeInitialized: () => {
        this.wasmReady.next(true)
      },
    }

    // instantiate the module
    this.module = Module(moduleArgs)
  }

  public greet(input: string) {
    this.wasmReady.pipe(filter(value => value === true)).pipe(map(() => {this.module._greet(input)}))
  }
}
