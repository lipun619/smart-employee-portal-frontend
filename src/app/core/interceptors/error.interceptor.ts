import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Global error interceptor — catches ALL HTTP errors in one place.
 *
 * Maps HTTP status codes to user-friendly messages:
 * 401 → "Unauthorized" (Phase 2: redirect to login)
 * 403 → "Forbidden"
 * 404 → "Not found"
 * 409 → "Conflict" (e.g., duplicate email)
 * 422 → "Validation errors" (field-level, handled by forms)
 * 500 → "Server error"
 *
 * This means individual components never need their own error handling for HTTP failures.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError(error => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        message = 'Cannot connect to server. Please check your connection.';
      } else if (error.status === 401) {
        message = 'Unauthorized. Please log in.';
        // Phase 2: inject(AuthService).logout();
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = error.error?.message ?? 'The requested resource was not found.';
      } else if (error.status === 409) {
        message = error.error?.message ?? 'A conflict occurred.';
      } else if (error.status === 422) {
        // Validation errors — let the form component handle field-level display
        // Just return so the form can process error.error.errors
        return throwError(() => error);
      } else if (error.status >= 500) {
        message = 'A server error occurred. Please try again later.';
      }

      snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });

      return throwError(() => error);
    })
  );
};
