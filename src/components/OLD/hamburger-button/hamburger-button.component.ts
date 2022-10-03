import { Component } from '@angular/core';

import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hamburger-button',
  templateUrl: './hamburger-button.component.html',
  styleUrls: ['./hamburger-button.component.css']
})
export class HamburgerButtonComponent implements AfterViewInit {

    @ViewChild('hamburgerMenu') hamburgerMenu: ElementRef;

    // Emits a "hamburgerEvent" with a boolean value
    // The button has logic to always toggle between true and false
    // just add (hamburgerEvent)="someFunction($event)" to your html tag
    @Output() hamburgerEvent = new EventEmitter<boolean>();

    addEvent(value: boolean) {
        this.hamburgerEvent.emit(value);
    }

    public expanded: any;

    onClick() {
        this.expanded = this.hamburgerMenu.nativeElement.getAttribute('aria-expanded');

        if(this.expanded === "false") {
            this.hamburgerMenu.nativeElement.setAttribute('aria-expanded', 'true');
            this.addEvent(true);
        } else {
            this.hamburgerMenu.nativeElement.setAttribute('aria-expanded', 'false');
            this.addEvent(false);
        }
    }

    ngAfterViewInit() {
    }

}
