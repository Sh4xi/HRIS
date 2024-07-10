import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Adjust the path if necessary
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    
    const result = TestBed.runInInjectionContext(authGuard);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    
    const result = TestBed.runInInjectionContext(authGuard);
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});