import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DietChartComponent } from './diet-chart.component';

describe('DietChartComponent', () => {
  let component: DietChartComponent;
  let fixture: ComponentFixture<DietChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DietChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DietChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
