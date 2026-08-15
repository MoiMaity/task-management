import type { ApiResponse } from '@tms/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const TOKEN_STORAGE_KEY = 'app-access-token';

/**
 * Thrown for any non-2xx response, or any response whose envelope reports
 * failure. Carries the server's error code and field details so callers can
 * show `message` and map `details` onto form inputs.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      /* private mode rejects writes; the session still works in memory */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      /* no-op */
    }
  },
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Appended as a query string; undefined, null and '' are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Single entry point for every call to the API.
 *
 * Centralising it means the auth header, the response envelope and the error
 * shape are each handled in exactly one place. Callers receive the unwrapped
 * `data` and only ever have to catch `ApiError`.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;

  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const token = tokenStore.get();

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // Network-level failure: no response at all. Worth distinguishing from a
    // server error so the UI can suggest checking the connection.
    throw new ApiError('Cannot reach the server. Check your connection.', 0, 'NETWORK_ERROR');
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'The server returned an unreadable response. Try again in a moment.',
      response.status,
      'INVALID_RESPONSE',
    );
  }

  if (!response.ok || payload.success === false) {
    const error = payload.success === false ? payload.error : undefined;
    throw new ApiError(
      error?.message ?? 'Something went wrong. Try again.',
      response.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.details,
    );
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
