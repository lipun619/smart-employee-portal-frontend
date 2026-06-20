import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * app.config.ts — replaces the old AppModule entirely.
 * All providers (DI registrations) for the whole app are declared here.
 *
 * Key providers:
 * - provideRouter: sets up routing with withComponentInputBinding (route params as @Input)
 * - provideHttpClient: enables HttpClient with functional interceptors
 * - provideAnimationsAsync: lazy-loads Material animations (better performance)
 * - Interceptors: auth (adds JWT header) + error (global error handling)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync()
  ]
};

