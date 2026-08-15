/**
 * Every API response uses one of these two shapes, so the web client has a
 * single place to unwrap data and a single place to handle failure.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    /** Machine-readable code the UI can branch on, e.g. 'VALIDATION_FAILED'. */
    code: string;
    /** Human-readable message safe to surface in the interface. */
    message: string;
    /** Field-level messages for form errors, keyed by field name. */
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
