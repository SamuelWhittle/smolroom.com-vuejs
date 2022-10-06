import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-led-matrix',
  templateUrl: './led-matrix.component.html',
  styleUrls: ['./led-matrix.component.css']
})
export class LedMatrixComponent implements AfterViewInit {

    public vh: number = window.innerHeight * 0.01;
    public containerHeight: string = `${this.vh * 100}px`;

    @HostListener('window:resize', ['$event']) windowResize() {
        this.setContainerHeight();
    }

    constructor() {}

    ngAfterViewInit(): void {
        this.setContainerHeight();
    }

    setContainerHeight() {
        this.vh = window.innerHeight * 0.01;
        this.containerHeight = `${this.vh * 100}px`;
    }

}
