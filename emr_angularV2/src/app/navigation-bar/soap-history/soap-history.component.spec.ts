import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapHistoryComponent } from './soap-history.component';

describe('SoapHistoryComponent', () => {
  let component: SoapHistoryComponent;
  let fixture: ComponentFixture<SoapHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoapHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoapHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
