import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiefComplaintsComponent } from './chief-complaints.component';

describe('ChiefComplaintsComponent', () => {
  let component: ChiefComplaintsComponent;
  let fixture: ComponentFixture<ChiefComplaintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChiefComplaintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiefComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
