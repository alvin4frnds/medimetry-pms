import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientUniqueIdComponent } from './patient-unique-id.component';

describe('PatientUniqueIdComponent', () => {
  let component: PatientUniqueIdComponent;
  let fixture: ComponentFixture<PatientUniqueIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientUniqueIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientUniqueIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
