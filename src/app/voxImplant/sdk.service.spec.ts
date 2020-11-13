import { TestBed } from '@angular/core/testing';

import { SDKService } from './sdk.service';

describe('SDKService', () => {
  let service: SDKService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SDKService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
