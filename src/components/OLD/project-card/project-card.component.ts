import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-project-card',
    templateUrl: './project-card.component.html',
    styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent implements OnInit {

    constructor() { }

    @Input() projectInfo;

    ngOnInit(): void {
        console.log(this.projectInfo);
    }

}
