import { TestBed } from '@angular/core/testing';

import { LoginAttemptService } from './login-attempt.service';

describe('LoginAttemptService', () => {
  let service: LoginAttemptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginAttemptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
