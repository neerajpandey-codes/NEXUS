import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  deleteConversationDocuments,
  deleteStoredDocument,
  getConversationDocumentContext,
  loadConversationDocuments,
  saveExtractedDocument,
} from './documentStorage.js'

class FakeTransaction {
  pending = 0
  completeQueued = false

  constructor(records) {
    this.records = records
  }

  request(operation) {
    const request = {}
    this.pending += 1
    queueMicrotask(() => {
      try {
        request.result = operation()
        request.onsuccess?.()
      } catch (error) {
        request.error = error
        request.onerror?.()
      } finally {
        this.pending -= 1
        this.completeWhenIdle()
      }
    })
    return request
  }

  completeWhenIdle() {
    if (this.pending || this.completeQueued) return
    this.completeQueued = true
    queueMicrotask(() => this.oncomplete?.())
  }

  objectStore() {
    const records = this.records
    return {
      put: (record) => this.request(() => records.set(record.key, record)),
      delete: (key) => this.request(() => records.delete(key)),
      index: () => ({
        getAll: (conversationId) => this.request(() => [...records.values()].filter(
          (record) => record.conversationId === conversationId,
        )),
      }),
    }
  }
}

class FakeIndexedDB {
  records = new Map()

  open() {
    const request = {}
    queueMicrotask(() => {
      request.result = {
        objectStoreNames: { contains: () => true },
        createObjectStore: () => ({ createIndex() {} }),
        transaction: () => new FakeTransaction(this.records),
        close() {},
      }
      request.onsuccess?.()
    })
    return request
  }
}

const document = (documentId, extractedText) => ({
  documentId,
  filename: `${documentId}.pdf`,
  pageCount: 2,
  characterCount: extractedText.length,
  extractedText,
})

test('extracted text is associated with a conversation and restored from IndexedDB', async () => {
  const indexedDB = new FakeIndexedDB()
  const source = document('doc-a', 'Text for conversation A')

  await saveExtractedDocument('conversation-a', source, indexedDB)

  assert.deepEqual(await loadConversationDocuments('conversation-a', indexedDB), [
    { ...source, conversationId: 'conversation-a', key: '["conversation-a","doc-a"]' },
  ])
  assert.deepEqual(await loadConversationDocuments('conversation-b', indexedDB), [])
})

test('documents for different conversations remain isolated', async () => {
  const indexedDB = new FakeIndexedDB()
  await saveExtractedDocument('conversation-a', document('same-id', 'A text'), indexedDB)
  await saveExtractedDocument('conversation-b', document('same-id', 'B text'), indexedDB)

  assert.equal((await loadConversationDocuments('conversation-a', indexedDB))[0].extractedText, 'A text')
  assert.equal((await loadConversationDocuments('conversation-b', indexedDB))[0].extractedText, 'B text')
})

test('removing one document deletes only that conversation document', async () => {
  const indexedDB = new FakeIndexedDB()
  await saveExtractedDocument('conversation-a', document('doc-a', 'A'), indexedDB)
  await saveExtractedDocument('conversation-a', document('doc-b', 'B'), indexedDB)
  await saveExtractedDocument('conversation-b', document('doc-a', 'Other conversation'), indexedDB)

  await deleteStoredDocument('conversation-a', 'doc-a', indexedDB)

  assert.deepEqual((await loadConversationDocuments('conversation-a', indexedDB)).map((item) => item.documentId), ['doc-b'])
  assert.equal((await loadConversationDocuments('conversation-b', indexedDB))[0].extractedText, 'Other conversation')
})

test('deleting a conversation removes all of its stored documents only', async () => {
  const indexedDB = new FakeIndexedDB()
  await saveExtractedDocument('conversation-a', document('doc-a', 'A'), indexedDB)
  await saveExtractedDocument('conversation-a', document('doc-b', 'B'), indexedDB)
  await saveExtractedDocument('conversation-b', document('doc-c', 'C'), indexedDB)

  await deleteConversationDocuments('conversation-a', indexedDB)

  assert.deepEqual(await loadConversationDocuments('conversation-a', indexedDB), [])
  assert.equal((await loadConversationDocuments('conversation-b', indexedDB))[0].documentId, 'doc-c')
})

test('IndexedDB failures reject with a readable storage error', async () => {
  await assert.rejects(loadConversationDocuments('conversation-a', null), /IndexedDB/)
})

test('request context uses multiple documents belonging only to the active conversation', async () => {
  const indexedDB = new FakeIndexedDB()
  const first = document('doc-a', 'A text')
  const second = document('doc-b', 'B text')
  await saveExtractedDocument('conversation-a', first, indexedDB)
  await saveExtractedDocument('conversation-a', second, indexedDB)
  await saveExtractedDocument('conversation-b', document('doc-c', 'Private B text'), indexedDB)

  const context = await getConversationDocumentContext('conversation-a', [first, second], indexedDB)

  assert.deepEqual(context, [
    { document_id: 'doc-a', filename: 'doc-a.pdf', extracted_text: 'A text' },
    { document_id: 'doc-b', filename: 'doc-b.pdf', extracted_text: 'B text' },
  ])
  assert.equal(JSON.stringify(context).includes('Private B text'), false)
})

test('removed documents are omitted from later request context', async () => {
  const indexedDB = new FakeIndexedDB()
  const removed = document('doc-remove', 'Do not send')
  const retained = document('doc-keep', 'Send this')
  await saveExtractedDocument('conversation-a', removed, indexedDB)
  await saveExtractedDocument('conversation-a', retained, indexedDB)
  await deleteStoredDocument('conversation-a', removed.documentId, indexedDB)

  const context = await getConversationDocumentContext('conversation-a', [retained], indexedDB)

  assert.deepEqual(context.map((item) => item.extracted_text), ['Send this'])
})

test('document context fails closed when IndexedDB cannot be read or a record is missing', async () => {
  const metadata = [{ documentId: 'doc-a', filename: 'doc-a.pdf' }]
  await assert.rejects(
    getConversationDocumentContext('conversation-a', metadata, null),
    /message was not sent/,
  )

  const indexedDB = new FakeIndexedDB()
  await assert.rejects(
    getConversationDocumentContext('conversation-a', metadata, indexedDB),
    /is unavailable/,
  )
})
