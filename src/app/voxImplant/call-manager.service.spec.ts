import { TestBed } from '@angular/core/testing';

import { CallManagerService } from './call-manager.service';

describe('CallManagerService', () => {
  let service: CallManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
