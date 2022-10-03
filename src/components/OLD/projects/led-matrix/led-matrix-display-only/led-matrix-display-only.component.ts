import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { LEDMatrixService } from '../../../../services/led-matrix.service';

import { Color } from '../../../../classes/Color';

@Component({
  selector: 'led-matrix-display-only',
  templateUrl: './led-matrix-display-only.component.html',
  styleUrls: ['./led-matrix-display-only.component.css'],
  providers: [ LEDMatrixService ]
})
export class LedMatrixDisplayOnlyComponent implements AfterViewInit {
    // main div reference, used for most events
    @ViewChild('divGrid') divGrid: ElementRef;
    // QueryList of the divs used to display color
    @ViewChildren('colorDiv') colorDivsQueryList: QueryList<ElementRef>;

    // 900 colors coresponding to the 30x30 grid
    public colors: Color[] = new Array(900).fill(new Color()).map((_, index) => new Color(0, 0, 0, 0, `${index}`));
    // Array used to save the ElementRefs from the QueryList
    public colorDivsArray: ElementRef[];

    // The interval at which this script will ping the server for updates
    private updateInterval: number;

    // subscription used to listen for the service to push a new frame/picture/array of 3600 numbers
    private stateSubscription: any;

    constructor( @Inject(DOCUMENT) private document, 
    private ledMatrixService: LEDMatrixService ) {
        this.stateSubscription = ledMatrixService.receivedState.subscribe((value) => this.receivedState(value));
    }

    ngAfterViewInit(): void {
        // Fill the divs array with the QueryList in array form
        this.colorDivsArray = this.colorDivsQueryList.toArray();
        // move the divs into the correct grid positions
        this.applyGridToDivs(this.colorDivsArray);
        // start the interval
        this.main();
    }

    ngOnDestroy() {
        this.stateSubscription.unsubscribe();
    }

    main() {
        this.updateInterval = setInterval(() => this.ledMatrixService.getPicture(), 1000/24);
    }

    receivedState(state: number[]) {
        for( let colorsIndex = 0; colorsIndex < 900; colorsIndex ++ ) {
          for( let rgbaIndex = 0; rgbaIndex < 4; rgbaIndex ++ ){
              this.colors[colorsIndex].rgb[rgbaIndex] = state[ ( colorsIndex * 4 ) + rgbaIndex ];
          }
      }
  }

  // pass in an array of ElementRefs and the function wil move them to the correct locations
  applyGridToDivs(divs: ElementRef[]) {
      divs.map((div, index) => {
          let dims: number[] = this.getTwoDimsIndexFromOneDim(index, 30);
          div.nativeElement.style.gridColumn = dims[0] + 1;
          div.nativeElement.style.gridRow = dims[1] + 1;
      });
  }

  // given a single dimensional index and the length of the second dimension, return the equivalent two dimensional index
  getTwoDimsIndexFromOneDim(oneDimIndex: number, secondDimLength: number) {
      return [oneDimIndex % secondDimLength, Math.floor(oneDimIndex / secondDimLength)];
    }

    // given a first and second dimension index and the length of the second dimension, return the equivalent single dimensional index
    getOneDimIndexFromTwoDims(firstDimIndex: number, secondDimIndex: number, secondDimLength: number) {
        return ( firstDimIndex * secondDimLength ) + secondDimIndex;
    }
}
