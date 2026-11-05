export const CHAT_STORAGE_KEY = 'nexus-chat-history-v1'

const getBrowserStorage = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeMessage = (message) => {
  if (!isRecord(message) || message.isDemo || !['user', 'assistant'].includes(message.role)) return null
  if (typeof message.id !== 'string' || typeof message.content !== 'string' || !message.content.trim()) return null
  const normalized = { id: message.id, role: message.role, content: message.content }
  if (typeof message.time === 'string') normalized.time = message.time
  if (message.isError === true) normalized.isError = true
  return normalized
}

const normalizeDocumentMetadata = (document) => {
  if (!isRecord(document) || typeof document.documentId !== 'string' || !document.documentId.trim()) return null
  if (typeof document.filename !== 'string') return null
  if (!Number.isInteger(document.pageCount) || !Number.isInteger(document.characterCount)) return null
  return {
    documentId: document.documentId,
    filename: document.filename.slice(0, 255),
    pageCount: document.pageCount,
    characterCount: document.characterCount,
  }
}

const normalizeConversation = (conversation) => {
  if (!isRecord(conversation) || typeof conversation.id !== 'string' || !conversation.id.trim()) return null
  if (typeof conversation.title !== 'string' || !Array.isArray(conversation.messages)) return null
  const messages = conversation.messages.map(normalizeMessage).filter(Boolean)
  if (conversation.isDemo && messages.length === 0) return null
  const documents = []
  const documentIds = new Set()
  for (const document of Array.isArray(conversation.documents) ? conversation.documents : []) {
    const metadata = normalizeDocumentMetadata(document)
    if (!metadata || documentIds.has(metadata.documentId)) continue
    documentIds.add(metadata.documentId)
    documents.push(metadata)
  }
  return {
    id: conversation.id,
    title: conversation.title.trim() || 'New conversation',
    updated: typeof conversation.updated === 'string' ? conversation.updated : 'Just now',
    titleIsCustom: conversation.titleIsCustom === true,
    isDemo: false,
    messages,
    documents,
  }
}

export function loadChatState(storage = getBrowserStorage()) {
  if (!storage) return null
  try {
    const raw = storage.getItem(CHAT_STORAGE_KEY)
    if (raw === null) return null
    const saved = JSON.parse(raw)
    if (!isRecord(saved) || saved.version !== 1 || !Array.isArray(saved.conversations)) {
      storage.removeItem(CHAT_STORAGE_KEY)
      return null
    }

    const conversations = []
    const ids = new Set()
    for (const item of saved.conversations) {
      const conversation = normalizeConversation(item)
      if (!conversation || ids.has(conversation.id)) continue
      ids.add(conversation.id)
      conversations.push(conversation)
    }
    const activeId = conversations.some((conversation) => conversation.id === saved.activeId)
      ? saved.activeId
      : conversations[0]?.id ?? null
    return { conversations, activeId }
  } catch {
    try { storage.removeItem(CHAT_STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
    return null
  }
}

export function saveChatState(conversations, activeId, storage = getBrowserStorage()) {
  if (!storage) return false
  const safeConversations = []
  const ids = new Set()
  for (const item of conversations) {
    const conversation = normalizeConversation(item)
    if (!conversation || ids.has(conversation.id)) continue
    ids.add(conversation.id)
    safeConversations.push(conversation)
  }
  const safeActiveId = safeConversations.some((conversation) => conversation.id === activeId)
    ? activeId
    : safeConversations[0]?.id ?? null
  try {
    storage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      version: 1,
      activeId: safeActiveId,
      conversations: safeConversations,
    }))
    return true
  } catch {
    return false
  }
}

export function createConversation() {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return {
    id: `conversation-${randomId}`,
    title: 'New conversation',
    titleIsCustom: false,
    updated: 'Just now',
    isDemo: false,
    messages: [],
  }
}

export function appendConversationMessage(conversations, conversationId, message) {
  return conversations.map((conversation) => conversation.id === conversationId
    ? { ...conversation, updated: 'Just now', messages: [...conversation.messages, message] }
    : conversation)
}

export function attachDocumentToConversation(conversations, conversationId, document) {
  return conversations.map((conversation) => conversation.id === conversationId
    ? {
        ...conversation,
        isDemo: false,
        documents: [
          ...(conversation.documents ?? []).filter((item) => item.documentId !== document.documentId),
          document,
        ],
      }
    : conversation)
}

export function removeDocumentFromConversation(conversations, conversationId, documentId) {
  return conversations.map((conversation) => conversation.id === conversationId
    ? { ...conversation, documents: (conversation.documents ?? []).filter((item) => item.documentId !== documentId) }
    : conversation)
}

export function renameConversation(conversations, conversationId, title) {
  const cleanTitle = title.trim().slice(0, 80)
  if (!cleanTitle) return conversations
  return conversations.map((conversation) => conversation.id === conversationId
    ? { ...conversation, title: cleanTitle, titleIsCustom: true, isDemo: false }
    : conversation)
}

export function deleteConversation(conversations, conversationId) {
  return conversations.filter((conversation) => conversation.id !== conversationId)
}

export function makeConversationTitle(message) {
  const cleanMessage = message.trim().replace(/\s+/g, ' ')
  return cleanMessage.length > 42 ? `${cleanMessage.slice(0, 42).trimEnd()}…` : cleanMessage
}
