import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryGeneratorComponent } from './history-generator.component';

describe('HistoryGeneratorComponent', () => {
  let component: HistoryGeneratorComponent;
  let fixture: ComponentFixture<HistoryGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
