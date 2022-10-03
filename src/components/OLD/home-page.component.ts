import { Component, OnInit } from '@angular/core';

import { MainHeaderComponent } from '../../main-header/main-header.component';
import { LowProfileHeaderComponent } from '../../low-profile-header/low-profile-header.component';

import { WasmService } from '../../../services/wasm.service'

import { Project } from '../../../interfaces/project';
import { PROJECTLIST } from '../../../project-list';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  projectList: Project[] = PROJECTLIST;

  constructor(private wasmService: WasmService) { }

  ngOnInit(): void {
    this.wasmService.greet('test')
  }

}
