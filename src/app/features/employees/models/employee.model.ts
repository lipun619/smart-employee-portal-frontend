export type EmploymentStatus = 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
export type Gender = 'Male' | 'Female' | 'NonBinary' | 'PreferNotToSay';

/**
 * Matches EmployeeDto from the .NET backend.
 * Using string union types for enums — matches the JSON string values the API returns.
 */
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;       // ISO date string
  hireDate: string;           // ISO date string
  jobTitle?: string;
  salary?: number;
  employmentStatus: EmploymentStatus;
  gender: Gender;
  departmentId: string;
  departmentName?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  hireDate: string;
  jobTitle?: string;
  salary?: number;
  employmentStatus: EmploymentStatus;
  gender: Gender;
  departmentId: string;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

export const EMPLOYMENT_STATUS_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'OnLeave', label: 'On Leave' },
  { value: 'Terminated', label: 'Terminated' }
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'NonBinary', label: 'Non-Binary' },
  { value: 'PreferNotToSay', label: 'Prefer not to say' }
];
