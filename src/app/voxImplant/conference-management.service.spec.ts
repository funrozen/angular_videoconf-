import { TestBed } from '@angular/core/testing';

import { ConferenceManagementService } from './conference-management.service';

describe('ConferenceManagementService', () => {
  let service: ConferenceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
