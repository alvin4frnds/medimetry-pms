import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceLexComponent } from './voice-lex.component';

describe('VoiceLexComponent', () => {
  let component: VoiceLexComponent;
  let fixture: ComponentFixture<VoiceLexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoiceLexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceLexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
