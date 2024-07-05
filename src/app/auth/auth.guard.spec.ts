import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: jest.fn() } }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow the authenticated user to access app', () => {
    jest.spyOn(authService, 'isLoggedIn').mockReturnValue(true);
    expect(authGuard.canActivate()).toBe(true);
  });

  it('should redirect an unauthenticated user to the login route', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    jest.spyOn(authService, 'isLoggedIn').mockReturnValue(false);
    expect(authGuard.canActivate()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
