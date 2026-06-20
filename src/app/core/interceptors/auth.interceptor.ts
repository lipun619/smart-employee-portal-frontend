import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor — attaches the JWT Bearer token to every outgoing HTTP request.
 *
 * In Phase 1: token is empty (no auth yet).
 * In Phase 2: we'll read the token from the Entra ID auth service and inject it here.
 *
 * Why a functional interceptor? Angular 17+ recommends functional interceptors over
 * class-based ones — they're simpler, tree-shakable, and work with standalone apps.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Phase 2: replace with: const token = inject(AuthService).getToken();
  const token = null;

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
