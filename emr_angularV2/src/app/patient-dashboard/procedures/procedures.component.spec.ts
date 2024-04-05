import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProceduresComponent } from './procedures.component';
import {expect} from "@angular/platform-browser/testing/src/matchers";
import {describe} from "@angular/core/testing/src/testing_internal";

describe('ProceduresComponent', () => {
  let component: ProceduresComponent;
  let fixture: ComponentFixture<ProceduresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProceduresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
