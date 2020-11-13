import { TestBed } from '@angular/core/testing';

import { ChatManagerService } from './chat-manager.service';

describe('ChatManagerService', () => {
  let service: ChatManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
