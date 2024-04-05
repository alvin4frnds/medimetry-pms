import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindDoctorsComponent } from './bind-doctors.component';

describe('BindDoctorsComponent', () => {
  let component: BindDoctorsComponent;
  let fixture: ComponentFixture<BindDoctorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindDoctorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
