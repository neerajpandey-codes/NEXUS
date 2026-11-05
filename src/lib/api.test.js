import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { sendChatMessage, uploadPdf } from './api.js'
import { getConversationContext, initialConversations } from '../data/chatData.js'

const originalFetch = globalThis.fetch
const originalXMLHttpRequest = globalThis.XMLHttpRequest

afterEach(() => {
  globalThis.fetch = originalFetch
  globalThis.XMLHttpRequest = originalXMLHttpRequest
})

test('sendChatMessage parses the backend response field', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ response: '  Hello from Gemini.  ' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  assert.equal(await sendChatMessage('Hello'), 'Hello from Gemini.')
})

test('sendChatMessage sends prior turns once and leaves the current message separate', async () => {
  let submittedBody
  globalThis.fetch = async (_url, options) => {
    submittedBody = JSON.parse(options.body)
    return new Response(JSON.stringify({ response: 'Context understood.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const history = [
    { role: 'user', content: 'First turn' },
    { role: 'assistant', content: 'First answer' },
  ]

  await sendChatMessage('Current turn', { history })

  assert.deepEqual(submittedBody, { message: 'Current turn', history, document_context: [] })
})

test('sendChatMessage includes all active conversation PDFs on follow-up requests', async () => {
  const bodies = []
  globalThis.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body))
    return new Response(JSON.stringify({ response: 'Answer' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const documentContext = [
    { document_id: 'doc-a', filename: 'a.pdf', extracted_text: 'Text A' },
    { document_id: 'doc-b', filename: 'b.pdf', extracted_text: 'Text B' },
  ]

  await sendChatMessage('Summarize', { documentContext })
  await sendChatMessage('What was the second point?', {
    history: [{ role: 'user', content: 'Summarize' }, { role: 'assistant', content: 'Answer' }],
    documentContext,
  })

  assert.equal(bodies.length, 2)
  assert.deepEqual(bodies[0].document_context, documentContext)
  assert.deepEqual(bodies[1].document_context, documentContext)
})

test('conversation context omits demo messages and caps history at 20 turns', () => {
  const demo = initialConversations[0].messages
  const messages = [
    ...demo,
    { role: 'user', content: 'Failed turn', isError: true },
    ...Array.from({ length: 22 }, (_, index) => ({
      role: index % 2 ? 'assistant' : 'user',
      content: `Real turn ${index}`,
    })),
  ]

  const context = getConversationContext(messages)

  assert.equal(context.length, 20)
  assert.deepEqual(context[0], { role: 'user', content: 'Real turn 2' })
  assert.deepEqual(context.at(-1), { role: 'assistant', content: 'Real turn 21' })
  assert.equal(context.some((turn) => turn.content.includes('research')), false)
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

test('sendChatMessage displays backend document-context validation errors', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    detail: [{ msg: 'Value error, Combined document context is limited to 150000 characters.' }],
  }), { status: 422, headers: { 'Content-Type': 'application/json' } })

  await assert.rejects(
    sendChatMessage('Summarize', { documentContext: [{ document_id: 'x' }] }),
    /Combined document context is limited to 150000 characters/,
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

test('uploadPdf reports byte progress and parses extracted document data', async () => {
  class MockXMLHttpRequest {
    static lastInstance
    upload = {}
    status = 200
    responseText = JSON.stringify({
      document_id: 'document-1',
      filename: 'notes.pdf',
      page_count: 2,
      extracted_text: 'PDF contents',
      character_count: 12,
    })

    constructor() { MockXMLHttpRequest.lastInstance = this }

    open(method, url) { this.method = method; this.url = url }
    send(body) {
      this.body = body
      this.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 })
      queueMicrotask(() => this.onload())
    }
    abort() { this.onabort?.() }
  }
  globalThis.XMLHttpRequest = MockXMLHttpRequest
  const progress = []
  const result = await uploadPdf(new Blob(['pdf data']), { onProgress: (percent) => progress.push(percent) })

  assert.equal(result.document_id, 'document-1')
  assert.deepEqual(progress, [50])
  assert.equal(MockXMLHttpRequest.lastInstance.method, 'POST')
  assert.equal(MockXMLHttpRequest.lastInstance.url.endsWith('/api/documents/extract'), true)
  assert.equal(MockXMLHttpRequest.lastInstance.body.has('file'), true)
})
