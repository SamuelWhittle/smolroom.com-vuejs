import { Component, OnInit } from '@angular/core';

import { MainHeaderComponent } from '../../main-header/main-header.component';
import { ProjectCardComponent } from '../../project-card/project-card.component';

import { Project } from '../../../interfaces/project';
import { PROJECTLIST } from '../../../project-list';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent implements OnInit {

  projectList: Project[] = PROJECTLIST;

  constructor() { }

  ngOnInit(): void {
  }

}
