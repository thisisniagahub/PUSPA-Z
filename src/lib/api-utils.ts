/**
 * PUSPA V5 — API Input Validation Utility
 *
 * Shared utility for API route handlers providing:
 * - Pagination parameter parsing (handle NaN, negative, too large)
 * - Search sanitization (limit length, trim)
 * - Error response helpers (standardized error format)
 * - Success response helpers
 */

// ─── Constants ────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const MAX_SEARCH_LENGTH = 200

// ─── Pagination ───────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  pageSize: number
  skip: number
  take: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Parse and validate pagination parameters from URL search params.
 * Handles NaN, negative values, and excessively large page sizes.
 *
 * @example
 * ```ts
 * const { page, pageSize, skip, take } = parsePagination(searchParams)
 * const items = await db.case.findMany({ skip, take })
 * ```
 */
export function parsePagination(
  searchParams: URLSearchParams | Record<string, string | undefined>
): PaginationParams {
  const getParam = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)
    }
    return searchParams[key] ?? null
  }

  let page = parseInt(getParam('page') || '1', 10)
  let pageSize = parseInt(getParam('pageSize') || String(DEFAULT_PAGE_SIZE), 10)

  // Sanitize page
  if (isNaN(page) || page < 1) page = 1
  if (page > 10000) page = 10000 // Prevent absurdly large offsets

  // Sanitize pageSize
  if (isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

/**
 * Build pagination metadata from total count and current pagination params.
 */
export function buildPaginationMeta(
  totalItems: number,
  params: PaginationParams
): PaginationMeta {
  const totalPages = Math.max(Math.ceil(totalItems / params.pageSize), 1)

  return {
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  }
}

// ─── Search Sanitization ──────────────────────────────────────────

/**
 * Sanitize a search query string.
 * - Trims whitespace
 * - Limits length to prevent abuse
 * - Returns undefined for empty/whitespace-only queries
 *
 * @example
 * ```ts
 * const search = sanitizeSearch(searchParams.get('q'))
 * const where = search ? { name: { contains: search } } : {}
 * ```
 */
export function sanitizeSearch(
  value: string | null | undefined,
  maxLength: number = MAX_SEARCH_LENGTH
): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  return trimmed.length > maxLength
    ? trimmed.substring(0, maxLength)
    : trimmed
}

// ─── Sort Parameter Parsing ───────────────────────────────────────

export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const ALLOWED_SORT_DIRECTIONS = new Set(['asc', 'desc'])

/**
 * Parse and validate sort parameters.
 * Falls back to defaults if values are invalid.
 *
 * @param allowedFields - Whitelist of sortable field names. If provided,
 *   sortBy must be in this list or it falls back to the default.
 */
export function parseSort(
  searchParams: URLSearchParams | Record<string, string | undefined>,
  allowedFields?: string[],
  defaultSortBy: string = 'createdAt',
  defaultSortOrder: 'asc' | 'desc' = 'desc'
): SortParams {
  const getParam = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)
    }
    return searchParams[key] ?? null
  }

  let sortBy = getParam('sortBy') || defaultSortBy
  const sortOrderRaw = (getParam('sortOrder') || defaultSortOrder).toLowerCase()
  const sortOrder: 'asc' | 'desc' = ALLOWED_SORT_DIRECTIONS.has(sortOrderRaw)
    ? (sortOrderRaw as 'asc' | 'desc')
    : defaultSortOrder

  if (allowedFields && !allowedFields.includes(sortBy)) {
    sortBy = defaultSortBy
  }

  return { sortBy, sortOrder }
}

// ─── Standardized Error Response ──────────────────────────────────

export interface ApiError {
  error: string
  message: string
  details?: unknown
  code?: string
}

/**
 * Create a standardized error response.
 *
 * @example
 * ```ts
 * return errorResponse('Not found', 'Case not found', 404)
 * return errorResponse('Validation error', 'Invalid input', 400, { fields: ['amount'] })
 * ```
 */
export function errorResponse(
  error: string,
  message: string,
  status: number = 500,
  details?: unknown,
  code?: string
): Response {
  const body: ApiError = {
    error,
    message,
    ...(details !== undefined && { details }),
    ...(code !== undefined && { code }),
  }

  return Response.json(body, { status })
}

/**
 * 400 Bad Request error response.
 */
export function badRequestError(
  message: string = 'Bad request',
  details?: unknown
): Response {
  return errorResponse('bad_request', message, 400, details)
}

/**
 * 401 Unauthorized error response.
 */
export function unauthorizedError(
  message: string = 'Unauthorized'
): Response {
  return errorResponse('unauthorized', message, 401)
}

/**
 * 403 Forbidden error response.
 */
export function forbiddenError(
  message: string = 'Forbidden'
): Response {
  return errorResponse('forbidden', message, 403)
}

/**
 * 404 Not Found error response.
 */
export function notFoundError(
  message: string = 'Resource not found'
): Response {
  return errorResponse('not_found', message, 404)
}

/**
 * 429 Too Many Requests error response.
 */
export function rateLimitError(
  message: string = 'Too many requests. Please try again later.',
  headers?: HeadersInit
): Response {
  return new Response(
    JSON.stringify({ error: 'rate_limited', message }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...(headers ? Object.fromEntries(
          headers instanceof Headers
            ? headers.entries()
            : Array.isArray(headers)
              ? headers
              : Object.entries(headers)
        ) : {}),
      },
    }
  )
}

/**
 * 500 Internal Server Error response.
 */
export function internalServerError(
  message: string = 'Internal server error'
): Response {
  return errorResponse('internal_error', message, 500)
}

// ─── Standardized Success Response ────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  message?: string
  meta?: Record<string, unknown>
}

/**
 * Create a standardized success response.
 *
 * @example
 * ```ts
 * return successResponse(members, 'Members fetched successfully')
 * return successResponse(items, undefined, { pagination: buildPaginationMeta(count, params) })
 * ```
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
  status: number = 200
): Response {
  const body: ApiSuccess<T> = {
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  }

  return Response.json(body, { status })
}

/**
 * 201 Created success response.
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return successResponse(data, message, undefined, 201)
}

// ─── Request Body Parsing ─────────────────────────────────────────

/**
 * Safely parse a JSON request body. Returns null if parsing fails.
 */
export async function safeParseBody<T = unknown>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

/**
 * Require a JSON request body. Returns a 400 error response if parsing fails.
 */
export async function requireBody<T = unknown>(
  request: Request
): Promise<{ data: T } | { error: Response }> {
  const body = await safeParseBody<T>(request)
  if (body === null) {
    return { error: badRequestError('Invalid JSON body') }
  }
  return { data: body }
}
