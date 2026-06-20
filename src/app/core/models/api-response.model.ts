/**
 * Matches the ApiResponse<T> wrapper returned by the .NET API.
 * Every HTTP response from the backend has this shape:
 * { success: boolean, message: string, data: T, errors: {...} }
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

/**
 * Standard paginated list response from the backend.
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
