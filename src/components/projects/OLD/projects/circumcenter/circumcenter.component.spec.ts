import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircumcenterComponent } from './circumcenter.component';

describe('CircumcenterComponent', () => {
  let component: CircumcenterComponent;
  let fixture: ComponentFixture<CircumcenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircumcenterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CircumcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
