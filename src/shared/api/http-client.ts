import { FALLBACK_MESSAGE } from './error-message'
import { HttpError } from './http-error'
import { refreshAccessToken } from './token-refresh'
import { tokenStore } from './token-store'

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  params?: QueryParams
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, params?: QueryParams): URL {
  const url = new URL(path, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return url
}

function execute(url: URL, options: RequestOptions, withAuth: boolean): Promise<Response> {
  const headers = new Headers()
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const accessToken = tokenStore.get()
  if (withAuth && accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })
}

async function toHttpError(response: Response, authenticated: boolean): Promise<HttpError> {
  const body = await response
    .json()
    .then((value: unknown) => value as { errorMessage?: unknown })
    .catch(() => null)
  const message = typeof body?.errorMessage === 'string' ? body.errorMessage : FALLBACK_MESSAGE

  return new HttpError(response.status, message, authenticated)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true
  const url = buildUrl(path, options.params)

  let response = await execute(url, options, auth)

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await execute(url, options, auth)
  }

  if (!response.ok) throw await toHttpError(response, auth)

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }
  return (await response.json()) as T
}

export const httpClient = {
  request,
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return request<T>(path, { ...options, method: 'POST' })
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
}
