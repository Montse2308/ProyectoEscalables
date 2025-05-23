import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from api
        authService.logout();
        router.navigate(['/auth/login']);
      }

      const errorMessage = error.error?.message || error.statusText;
      return throwError(() => ({ error: { message: errorMessage } }));
    })
  );
};
