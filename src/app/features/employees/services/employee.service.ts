import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Department,
  EmployeeQueryParams
} from '../models/employee.model';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

/**
 * EmployeeService handles all HTTP communication with the .NET API.
 *
 * Responsibilities:
 * - Build HTTP requests with correct params
 * - Unwrap the ApiResponse<T> envelope — components receive plain data, not wrappers
 * - Return Observables — the store subscribes and updates Signals
 *
 * Why use inject() instead of constructor injection?
 * Angular 14+ recommended pattern for standalone components and services —
 * cleaner, no boilerplate constructor code.
 */
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;
  private readonly deptUrl = `${environment.apiUrl}/departments`;

  getEmployees(params: EmployeeQueryParams): Observable<PaginatedResponse<Employee>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm?.trim()) {
      httpParams = httpParams.set('searchTerm', params.searchTerm.trim());
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<Employee>>>(this.baseUrl, { params: httpParams })
      .pipe(map(res => res.data));
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http
      .get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  createEmployee(request: CreateEmployeeRequest): Observable<Employee> {
    return this.http
      .post<ApiResponse<Employee>>(this.baseUrl, request)
      .pipe(map(res => res.data));
  }

  updateEmployee(id: string, request: UpdateEmployeeRequest): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/${id}`, request);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http
      .get<ApiResponse<Department[]>>(this.deptUrl)
      .pipe(map(res => res.data));
  }
}
