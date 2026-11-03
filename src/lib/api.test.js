import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { sendChatMessage } from './api.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('sendChatMessage parses the backend response field', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ response: '  Hello from Gemini.  ' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  assert.equal(await sendChatMessage('Hello'), 'Hello from Gemini.')
})

test('sendChatMessage presents structured backend errors readably', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    detail: {
      code: 'gemini_provider_error',
      category: 'provider_overloaded',
      provider_status: 503,
      message: 'Temporary high demand. Please retry.',
    },
  }), { status: 503, headers: { 'Content-Type': 'application/json' } })

  await assert.rejects(
    sendChatMessage('Hello'),
    /provider overloaded \(HTTP 503\): Temporary high demand\. Please retry\./,
  )
})

test('sendChatMessage reports a request timeout', async () => {
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })

  await assert.rejects(sendChatMessage('Hello', { timeoutMs: 5 }), /took too long to respond/)
})

test('sendChatMessage preserves caller cancellation', async () => {
  const caller = new AbortController()
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })
  const pending = sendChatMessage('Hello', { signal: caller.signal, timeoutMs: 1000 })
  caller.abort()

  await assert.rejects(pending, (error) => error.name === 'AbortError')
})
