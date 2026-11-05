const fallbackApiBaseUrl = 'http://127.0.0.1:8000'

export const apiBaseUrl = (import.meta.env?.VITE_API_BASE_URL || fallbackApiBaseUrl).replace(/\/+$/, '')

export async function fetchBackendHealth({ signal } = {}) {
  const response = await fetch(`${apiBaseUrl}/api/health`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`)
  }

  const health = await response.json()
  if (health.status !== 'ok') {
    throw new Error('Backend returned an unexpected health status')
  }

  return health
}

export async function sendChatMessage(
  message,
  { history = [], documentContext = [], signal, timeoutMs = 60_000 } = {},
) {
  const controller = new AbortController()
  let timedOut = false
  const abortFromCaller = () => controller.abort(signal?.reason)
  if (signal?.aborted) abortFromCaller()
  else signal?.addEventListener('abort', abortFromCaller, { once: true })
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    let response
    try {
      response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history, document_context: documentContext }),
        signal: controller.signal,
      })
    } catch (error) {
      if (timedOut) throw new Error('NEXUS took too long to respond. Please try again.')
      if (signal?.aborted) throw error
      throw new Error('Could not reach the NEXUS backend. Check that it is running and try again.')
    }

    let result
    try {
      result = await response.json()
    } catch {
      if (timedOut) throw new Error('NEXUS took too long to respond. Please try again.')
      throw new Error('The NEXUS backend returned an unreadable response. Please try again.')
    }

    if (!response.ok) {
      const detail = result.detail
      if (typeof detail === 'string' && detail.trim()) throw new Error(detail)
      if (detail && typeof detail === 'object') {
        const message = typeof detail.message === 'string' ? detail.message : ''
        const category = typeof detail.category === 'string' ? detail.category.replaceAll('_', ' ') : ''
        const providerStatus = Number.isInteger(detail.provider_status) ? ` (HTTP ${detail.provider_status})` : ''
        if (message) throw new Error(`${category ? `${category}${providerStatus}: ` : ''}${message}`)
      }
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => typeof item?.msg === 'string' ? item.msg.replace(/^Value error, /, '') : '')
          .filter(Boolean)
        if (messages.length) throw new Error(messages.join(' '))
      }
      if (response.status === 422) throw new Error('Please enter a message of 8,000 characters or fewer.')
      throw new Error('NEXUS could not get a response right now. Please try again.')
    }

    if (typeof result.response !== 'string' || !result.response.trim()) {
      throw new Error('NEXUS returned an empty response. Please try again.')
    }
    return result.response.trim()
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

export function uploadPdf(file, { signal, onProgress, timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The upload was cancelled.', 'AbortError'))
      return
    }

    const request = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)
    request.open('POST', `${apiBaseUrl}/api/documents/extract`)
    request.timeout = timeoutMs

    const cleanup = () => signal?.removeEventListener('abort', abortRequest)
    const abortRequest = () => request.abort()

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    }
    request.onload = () => {
      cleanup()
      let result
      try {
        result = JSON.parse(request.responseText)
      } catch {
        reject(new Error('The NEXUS backend returned an unreadable upload response.'))
        return
      }
      if (request.status < 200 || request.status >= 300) {
        const detail = typeof result.detail === 'string' ? result.detail : ''
        reject(new Error(detail || 'NEXUS could not process this PDF. Please try another file.'))
        return
      }
      if (
        typeof result.document_id !== 'string'
        || typeof result.extracted_text !== 'string'
        || !Number.isInteger(result.page_count)
      ) {
        reject(new Error('The NEXUS backend returned incomplete PDF information.'))
        return
      }
      resolve(result)
    }
    request.onerror = () => {
      cleanup()
      reject(new Error('Could not reach the NEXUS backend to upload this PDF.'))
    }
    request.ontimeout = () => {
      cleanup()
      reject(new Error('PDF extraction took too long. Please try again.'))
    }
    request.onabort = () => {
      cleanup()
      reject(new DOMException('The upload was cancelled.', 'AbortError'))
    }
    signal?.addEventListener('abort', abortRequest, { once: true })
    try {
      request.send(formData)
    } catch {
      cleanup()
      reject(new Error('The PDF upload could not be started.'))
    }
  })
}
