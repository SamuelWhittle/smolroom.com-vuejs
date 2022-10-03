import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedMatrixDisplayOnlyComponent } from './led-matrix-display-only.component';

describe('LedMatrixDisplayOnlyComponent', () => {
  let component: LedMatrixDisplayOnlyComponent;
  let fixture: ComponentFixture<LedMatrixDisplayOnlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedMatrixDisplayOnlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedMatrixDisplayOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
