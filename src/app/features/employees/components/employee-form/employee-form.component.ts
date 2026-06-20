import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeStore } from '../../store/employee.store';
import { EmployeeService } from '../../services/employee.service';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  CreateEmployeeRequest
} from '../../models/employee.model';

/**
 * Employee Form handles BOTH create and edit in one component.
 * The route determines the mode:
 * - /employees/new     → create mode
 * - /employees/:id/edit → edit mode (pre-populates form from store)
 *
 * Uses Angular Reactive Forms for strong typing and built-in validation.
 * On submit: dispatches to EmployeeService, then navigates back to list.
 */
@Component({
  selector: 'app-employee-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule,
    MatCardModule, MatDividerModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(EmployeeStore);
  private readonly service = inject(EmployeeService);

  readonly isEditMode = signal(false);
  readonly employeeId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly serverErrors = signal<Record<string, string[]>>({});

  readonly statusOptions = EMPLOYMENT_STATUS_OPTIONS;
  readonly genderOptions = GENDER_OPTIONS;

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phoneNumber: ['', Validators.maxLength(20)],
    dateOfBirth: [null as Date | null],
    hireDate: [null as Date | null, Validators.required],
    jobTitle: ['', Validators.maxLength(100)],
    salary: [null as number | null, Validators.min(0)],
    employmentStatus: ['Active', Validators.required],
    gender: ['PreferNotToSay', Validators.required],
    departmentId: ['', Validators.required]
  });

  ngOnInit(): void {
    // Load departments for the dropdown
    if (this.store.departments().length === 0) {
      this.store.loadDepartments();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(id);
      this.store.loadEmployeeById(id);

      // Watch for employee data to arrive, then patch form
      // Using effect equivalent with subscribe
      this.service.getEmployeeById(id).subscribe(emp => {
        this.form.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phoneNumber: emp.phoneNumber ?? '',
          dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth) : null,
          hireDate: emp.hireDate ? new Date(emp.hireDate) : null,
          jobTitle: emp.jobTitle ?? '',
          salary: emp.salary ?? null,
          employmentStatus: emp.employmentStatus,
          gender: emp.gender,
          departmentId: emp.departmentId
        });
      });
    }
  }

  getError(field: string): string | null {
    const control = this.form.get(field);
    if (!control || (!control.dirty && !control.touched)) return null;

    if (control.hasError('required')) return `${this.fieldLabel(field)} is required.`;
    if (control.hasError('email')) return 'Please enter a valid email address.';
    if (control.hasError('maxlength')) return `${this.fieldLabel(field)} is too long.`;
    if (control.hasError('min')) return `${this.fieldLabel(field)} must be greater than 0.`;

    // Server-side validation errors
    const serverError = this.serverErrors()[field];
    if (serverError?.length) return serverError[0];

    return null;
  }

  private fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name', lastName: 'Last name', email: 'Email',
      hireDate: 'Hire date', departmentId: 'Department',
      jobTitle: 'Job title', salary: 'Salary'
    };
    return labels[field] ?? field;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.serverErrors.set({});

    const raw = this.form.getRawValue();

    const request: CreateEmployeeRequest = {
      firstName: raw.firstName!,
      lastName: raw.lastName!,
      email: raw.email!,
      phoneNumber: raw.phoneNumber || undefined,
      dateOfBirth: raw.dateOfBirth ? this.toIsoDate(raw.dateOfBirth) : undefined,
      hireDate: this.toIsoDate(raw.hireDate!),
      jobTitle: raw.jobTitle || undefined,
      salary: raw.salary ?? undefined,
      employmentStatus: raw.employmentStatus as any,
      gender: raw.gender as any,
      departmentId: raw.departmentId!
    };

    // Split into two separate subscribes to avoid incompatible union types
    // (createEmployee returns Observable<Employee>, updateEmployee returns Observable<void>)
    const onSuccess = () => {
      this.isSaving.set(false);
      this.router.navigate(['/employees']);
    };
    const onError = (err: { status: number; error?: { errors?: Record<string, string[]> } }) => {
      this.isSaving.set(false);
      if (err.status === 422 && err.error?.errors) {
        this.serverErrors.set(err.error.errors);
      }
    };

    if (this.isEditMode()) {
      this.service.updateEmployee(this.employeeId()!, request)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.service.createEmployee(request)
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  private toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
