import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeStore } from '../../store/employee.store';
import { EmployeeService } from '../../services/employee.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Employee } from '../../models/employee.model';

/**
 * Employee List — the main view showing a paginated, searchable table.
 *
 * Uses Signals for all reactive state (no manual subscribe/unsubscribe).
 * Uses @for control flow (Angular 17+ syntax — no *ngFor directive needed).
 * ChangeDetectionStrategy.OnPush — only re-renders when signals change.
 */
@Component({
  selector: 'app-employee-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule, MatTooltipModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  readonly store = inject(EmployeeStore);
  private readonly service = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'fullName', 'email', 'jobTitle', 'departmentName', 'employmentStatus', 'hireDate', 'actions'
  ];

  searchValue = '';

  ngOnInit(): void {
    this.store.loadDepartments();
    this.store.loadEmployees();
  }

  onSearch(): void {
    this.store.setSearch(this.searchValue);
  }

  onSearchClear(): void {
    this.searchValue = '';
    this.store.setSearch('');
  }

  onPageChange(event: PageEvent): void {
    this.store.pageSize.set(event.pageSize);
    this.store.setPage(event.pageIndex + 1); // Material paginator is 0-indexed
  }

  onView(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  onEdit(employee: Employee): void {
    this.router.navigate(['/employees', employee.id, 'edit']);
  }

  onDelete(employee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.deleteEmployee(employee.id).subscribe({
          next: () => {
            // Optimistic UI: remove from signal immediately, no need to reload
            this.store.removeFromList(employee.id);
          }
        });
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/employees/new']);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      Active: 'primary',
      Inactive: 'accent',
      OnLeave: 'warn',
      Terminated: ''
    };
    return colors[status] ?? '';
  }
}
