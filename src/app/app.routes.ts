import { Routes } from '@angular/router';

/**
 * Root application routes.
 * Each feature is lazy-loaded — Angular only downloads the code when the route is visited.
 * loadChildren points to the feature's own routes file.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('./features/employees/employees.routes')
        .then(m => m.employeeRoutes)
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
