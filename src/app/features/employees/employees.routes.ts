import { Routes } from '@angular/router';

/**
 * Employee feature routes — lazy loaded as a chunk.
 * This means the employee components are only downloaded when the user
 * navigates to /employees, keeping initial app bundle small.
 */
export const employeeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/employee-list/employee-list.component')
        .then(m => m.EmployeeListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/employee-form/employee-form.component')
        .then(m => m.EmployeeFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/employee-detail/employee-detail.component')
        .then(m => m.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/employee-form/employee-form.component')
        .then(m => m.EmployeeFormComponent)
  }
];
