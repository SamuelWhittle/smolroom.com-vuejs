import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowProfileHeaderComponent } from './low-profile-header.component';

describe('LowProfileHeaderComponent', () => {
  let component: LowProfileHeaderComponent;
  let fixture: ComponentFixture<LowProfileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LowProfileHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LowProfileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
