import { ENV } from '@/config/env'

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function buildApiUrl(endpoint) {
  return `${ENV.API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
}

export async function parseErrorResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (response.status >= 502 && (!data || typeof data !== 'object')) {
    return new ApiError(
      'Backend server is not responding on port 8000. Make sure Flask is running (python run.py).',
      response.status,
    )
  }

  const message =
    (data && typeof data === 'object' && (data.detail || data.message || data.error)) ||
    `Request failed with status ${response.status}`
  return new ApiError(message, response.status, data)
}

export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, signal } = options
  const url = buildApiUrl(endpoint)

  let response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err
    }
    throw new ApiError(
      'Cannot reach the backend server. Start the Flask backend on port 8000 (python run.py).',
      0,
    )
  }

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  return response
}

export async function apiRequest(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options)
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')
}
