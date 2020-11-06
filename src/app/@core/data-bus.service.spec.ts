import { TestBed } from '@angular/core/testing';

import { DataBusService } from './data-bus.service';

describe('DataBusService', () => {
  let service: DataBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
