import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerlinNoise1Component } from './perlin-noise1.component';

describe('PerlinNoise1Component', () => {
  let component: PerlinNoise1Component;
  let fixture: ComponentFixture<PerlinNoise1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerlinNoise1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerlinNoise1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
