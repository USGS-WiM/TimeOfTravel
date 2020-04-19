import { TestBed } from '@angular/core/testing';

import { UpstreamcalculatorService } from './upstreamcalculator.service';

describe('UpstreamcalculatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UpstreamcalculatorService = TestBed.get(UpstreamcalculatorService);
    expect(service).toBeTruthy();
  });
});
