import { TestBed } from '@angular/core/testing';

import { ScreenDetectorService } from './screen-detector.service';

describe('ScreenDetectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScreenDetectorService = TestBed.get(ScreenDetectorService);
    expect(service).toBeTruthy();
  });
});
