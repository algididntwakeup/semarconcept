// platform/frontend-mui/src/shared/api/types.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiPaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T[];
  items?: T[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    pages?: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
  code?: string;
}

export class NormalizedApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[] | string>;
  raw?: unknown;

  constructor(status: number, message: string, code?: string, errors?: Record<string, string[] | string>, raw?: unknown) {
    super(message);
    this.name = 'NormalizedApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.raw = raw;
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | number;
}
