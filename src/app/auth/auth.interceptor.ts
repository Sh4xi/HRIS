import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SupabaseService } from '../Supabase/supabase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private supabaseService: SupabaseService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    return from(this.supabaseService.refreshSession()).pipe(
      switchMap(() => {
        return next.handle(request);
      }),
      catchError((error) => {
        this.supabaseService.signOut();
        this.router.navigate(['/login']);
        return throwError(error);
      })
    );
  }
}