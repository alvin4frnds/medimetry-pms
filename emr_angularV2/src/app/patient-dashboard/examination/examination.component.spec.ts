import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationComponent } from './examination.component';
import {expect} from "@angular/platform-browser/testing/src/matchers";
import {describe} from "@angular/core/testing/src/testing_internal";

describe('ExaminationComponent', () => {
  let component: ExaminationComponent;
  let fixture: ComponentFixture<ExaminationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
