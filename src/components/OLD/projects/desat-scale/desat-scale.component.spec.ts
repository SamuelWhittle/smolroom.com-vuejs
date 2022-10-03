import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesatScaleComponent } from './desat-scale.component';

describe('DesatScaleComponent', () => {
  let component: DesatScaleComponent;
  let fixture: ComponentFixture<DesatScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesatScaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesatScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
