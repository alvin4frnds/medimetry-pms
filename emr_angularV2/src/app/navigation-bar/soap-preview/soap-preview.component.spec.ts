import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapPreviewComponent } from './soap-preview.component';
import {expect} from "@angular/platform-browser/testing/src/matchers";
import {describe} from "@angular/core/testing/src/testing_internal";

describe('SoapPreviewComponent', () => {
  let component: SoapPreviewComponent;
  let fixture: ComponentFixture<SoapPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoapPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoapPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
