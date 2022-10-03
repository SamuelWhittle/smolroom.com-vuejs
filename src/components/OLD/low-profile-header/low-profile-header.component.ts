import { Component, OnInit } from '@angular/core';

import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-low-profile-header',
  templateUrl: './low-profile-header.component.html',
  styleUrls: ['./low-profile-header.component.css']
})
export class LowProfileHeaderComponent implements OnInit {

    @ViewChild('primaryNavigation') primaryNavigation : ElementRef;

    constructor() { }

    ngOnInit(): void {
    }

    toggleMenu(state: boolean) {
        this.primaryNavigation.nativeElement.setAttribute('data-visible', state);
    }
}
