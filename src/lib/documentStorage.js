const DATABASE_NAME = 'nexus-chat-documents'
const DATABASE_VERSION = 1
const STORE_NAME = 'documents'

const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error || new Error('Browser document storage request failed.'))
})

const transactionComplete = (transaction) => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error || new Error('Browser document storage transaction failed.'))
  transaction.onabort = () => reject(transaction.error || new Error('Browser document storage transaction was cancelled.'))
})

const openDatabase = (factory = globalThis.indexedDB) => new Promise((resolve, reject) => {
  if (!factory) {
    reject(new Error('This browser does not provide IndexedDB.'))
    return
  }
  let request
  try {
    request = factory.open(DATABASE_NAME, DATABASE_VERSION)
  } catch {
    reject(new Error('Browser document storage is unavailable.'))
    return
  }
  request.onupgradeneeded = () => {
    const database = request.result
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' })
      store.createIndex('conversationId', 'conversationId', { unique: false })
    }
  }
  request.onsuccess = () => {
    request.result.onversionchange = () => request.result.close()
    resolve(request.result)
  }
  request.onerror = () => reject(new Error('Browser document storage could not be opened.'))
  request.onblocked = () => reject(new Error('Browser document storage is blocked by another tab.'))
})

const recordKey = (conversationId, documentId) => JSON.stringify([conversationId, documentId])

const withDatabase = async (factory, operation) => {
  const database = await openDatabase(factory)
  try {
    return await operation(database)
  } catch {
    throw new Error('Browser document storage failed. Check available storage and try again.')
  } finally {
    database.close()
  }
}

export function saveExtractedDocument(conversationId, document, factory = globalThis.indexedDB) {
  return withDatabase(factory, async (database) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const done = transactionComplete(transaction)
    transaction.objectStore(STORE_NAME).put({
      key: recordKey(conversationId, document.documentId),
      conversationId,
      documentId: document.documentId,
      filename: document.filename,
      pageCount: document.pageCount,
      characterCount: document.characterCount,
      extractedText: document.extractedText,
    })
    await done
  })
}

export function loadConversationDocuments(conversationId, factory = globalThis.indexedDB) {
  return withDatabase(factory, async (database) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const done = transactionComplete(transaction)
    const request = transaction.objectStore(STORE_NAME).index('conversationId').getAll(conversationId)
    const records = await requestResult(request)
    await done
    return records.filter((record) => (
      record?.conversationId === conversationId
      && typeof record.documentId === 'string'
      && typeof record.extractedText === 'string'
    ))
  })
}

export async function getConversationDocumentContext(
  conversationId,
  documentMetadata,
  factory = globalThis.indexedDB,
) {
  if (!documentMetadata.length) return []
  if (documentMetadata.length > 3) {
    throw new Error('A maximum of three PDFs can be used in one request. Remove a PDF and try again.')
  }

  let storedDocuments
  try {
    storedDocuments = await loadConversationDocuments(conversationId, factory)
  } catch {
    throw new Error('Could not read this conversation\'s PDFs from browser storage. The message was not sent.')
  }
  const byId = new Map(storedDocuments.map((document) => [document.documentId, document]))
  return documentMetadata.map((metadata) => {
    const document = byId.get(metadata.documentId)
    if (!document || !document.extractedText.trim()) {
      throw new Error(`Saved PDF "${metadata.filename}" is unavailable. The message was not sent.`)
    }
    return {
      document_id: document.documentId,
      filename: metadata.filename,
      extracted_text: document.extractedText,
    }
  })
}

export function deleteStoredDocument(conversationId, documentId, factory = globalThis.indexedDB) {
  return withDatabase(factory, async (database) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const done = transactionComplete(transaction)
    transaction.objectStore(STORE_NAME).delete(recordKey(conversationId, documentId))
    await done
  })
}

export function deleteConversationDocuments(conversationId, factory = globalThis.indexedDB) {
  return withDatabase(factory, async (database) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const done = transactionComplete(transaction)
    const store = transaction.objectStore(STORE_NAME)
    const request = store.index('conversationId').getAll(conversationId)
    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        request.result.forEach((record) => store.delete(record.key))
        resolve()
      }
      request.onerror = () => reject(request.error || new Error('Browser document cleanup failed.'))
    })
    await done
  })
}
