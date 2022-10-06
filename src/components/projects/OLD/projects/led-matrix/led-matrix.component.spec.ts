import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedMatrixComponent } from './led-matrix.component';

describe('LedMatrixComponent', () => {
  let component: LedMatrixComponent;
  let fixture: ComponentFixture<LedMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
