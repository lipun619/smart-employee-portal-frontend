import { Injectable, computed, inject, signal } from '@angular/core';
import { Employee, EmployeeQueryParams, Department } from '../models/employee.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { EmployeeService } from '../services/employee.service';

/**
 * EmployeeStore — Signal-based reactive state management.
 *
 * Why Signals instead of RxJS BehaviorSubject?
 * - Simpler to read and write — just get/set values
 * - Angular's change detection is fine-grained with Signals (no need for OnPush)
 * - `computed()` automatically recalculates when its dependencies change
 * - `effect()` runs side effects when signals change (like logging or syncing)
 *
 * State lives here, HTTP calls live in EmployeeService.
 * Components inject this store and read from signals — they never call the service directly.
 */
@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  private readonly service = inject(EmployeeService);

  // ── Raw state signals ──────────────────────────────────────────────────────
  readonly employees = signal<Employee[]>([]);
  readonly selectedEmployee = signal<Employee | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly totalCount = signal<number>(0);
  readonly pageNumber = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // ── Computed signals (auto-recalculate when dependencies change) ───────────

  /** Total number of pages based on total count and page size */
  readonly totalPages = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize())
  );

  /** Whether there is a next page */
  readonly hasNextPage = computed(() => this.pageNumber() < this.totalPages());

  /** Whether there is a previous page */
  readonly hasPreviousPage = computed(() => this.pageNumber() > 1);

  // ── Actions ────────────────────────────────────────────────────────────────

  loadEmployees(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: EmployeeQueryParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined
    };

    this.service.getEmployees(params).subscribe({
      next: (res: PaginatedResponse<Employee>) => {
        this.employees.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadEmployeeById(id: string): void {
    this.isLoading.set(true);

    this.service.getEmployeeById(id).subscribe({
      next: (emp) => {
        this.selectedEmployee.set(emp);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadDepartments(): void {
    this.service.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts)
    });
  }

  setPage(page: number): void {
    this.pageNumber.set(page);
    this.loadEmployees();
  }

  setSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageNumber.set(1); // Reset to page 1 on new search
    this.loadEmployees();
  }

  clearSelected(): void {
    this.selectedEmployee.set(null);
  }

  /** Removes deleted employee from local signal immediately (optimistic UI update) */
  removeFromList(id: string): void {
    this.employees.update(list => list.filter(e => e.id !== id));
    this.totalCount.update(c => c - 1);
  }
}
