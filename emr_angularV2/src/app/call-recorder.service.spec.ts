import { TestBed } from '@angular/core/testing';

import { CallRecorderService } from './call-recorder.service';

describe('CallRecorderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallRecorderService = TestBed.get(CallRecorderService);
    expect(service).toBeTruthy();
  });
});
