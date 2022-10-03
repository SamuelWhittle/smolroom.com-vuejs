import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedMatrixDisplayInteractiveComponent } from './led-matrix-display-interactive.component';

describe('LedMatrixDisplayInteractiveComponent', () => {
  let component: LedMatrixDisplayInteractiveComponent;
  let fixture: ComponentFixture<LedMatrixDisplayInteractiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedMatrixDisplayInteractiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedMatrixDisplayInteractiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
