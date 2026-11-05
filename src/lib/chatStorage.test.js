import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialConversations } from '../data/chatData.js'
import {
  CHAT_STORAGE_KEY,
  appendConversationMessage,
  attachDocumentToConversation,
  createConversation,
  deleteConversation,
  loadChatState,
  makeConversationTitle,
  removeDocumentFromConversation,
  renameConversation,
  saveChatState,
} from './chatStorage.js'

class MemoryStorage {
  values = new Map()

  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, value) }
  removeItem(key) { this.values.delete(key) }
}

test('saved conversations restore after a simulated page refresh', () => {
  const storage = new MemoryStorage()
  const conversation = createConversation()
  const withUser = appendConversationMessage([conversation], conversation.id, {
    id: 'user-1', role: 'user', content: 'Remember this detail', time: 'Now',
  })
  const withAssistant = appendConversationMessage(withUser, conversation.id, {
    id: 'assistant-1', role: 'assistant', content: 'I will remember it.', time: 'Now',
  })

  assert.equal(saveChatState(withAssistant, conversation.id, storage), true)
  const restored = loadChatState(storage)

  assert.equal(restored.activeId, conversation.id)
  assert.deepEqual(restored.conversations[0].messages.map(({ role, content }) => ({ role, content })), [
    { role: 'user', content: 'Remember this detail' },
    { role: 'assistant', content: 'I will remember it.' },
  ])
})

test('new conversations get unique IDs and retain independent histories when switched', () => {
  const storage = new MemoryStorage()
  const first = createConversation()
  const second = createConversation()
  assert.notEqual(first.id, second.id)
  const conversations = appendConversationMessage(
    appendConversationMessage([first, second], first.id, {
      id: 'first-user', role: 'user', content: 'First conversation',
    }),
    second.id,
    { id: 'second-user', role: 'user', content: 'Second conversation' },
  )

  saveChatState(conversations, second.id, storage)
  const restored = loadChatState(storage)

  assert.equal(restored.activeId, second.id)
  assert.deepEqual(restored.conversations.find(({ id }) => id === first.id).messages.map((m) => m.content), ['First conversation'])
  assert.deepEqual(restored.conversations.find(({ id }) => id === second.id).messages.map((m) => m.content), ['Second conversation'])
})

test('conversations can be renamed and individually deleted', () => {
  const storage = new MemoryStorage()
  const first = createConversation()
  const second = createConversation()
  const renamed = renameConversation([first, second], first.id, 'Project planning')
  const remaining = deleteConversation(renamed, second.id)

  saveChatState(remaining, first.id, storage)

  assert.deepEqual(loadChatState(storage).conversations.map(({ title }) => title), ['Project planning'])
  assert.equal(loadChatState(storage).conversations[0].titleIsCustom, true)
})

test('default title comes from the first user message', () => {
  assert.equal(makeConversationTitle('  Plan   my next project  '), 'Plan my next project')
})

test('demo messages and unrecognized secret fields are not persisted', () => {
  const storage = new MemoryStorage()
  const demo = initialConversations[0]
  const mixed = {
    ...demo,
    isDemo: false,
    apiKey: 'must not be stored',
    messages: [
      ...demo.messages,
      { id: 'real-1', role: 'user', content: 'A real follow-up' },
    ],
  }

  saveChatState([mixed], mixed.id, storage)
  const raw = storage.getItem(CHAT_STORAGE_KEY)
  const restored = loadChatState(storage)

  assert.equal(raw.includes('must not be stored'), false)
  assert.deepEqual(restored.conversations[0].messages.map((message) => message.content), ['A real follow-up'])
})

test('corrupted LocalStorage content is cleared safely', () => {
  const storage = new MemoryStorage()
  storage.setItem(CHAT_STORAGE_KEY, '{not valid json')

  assert.equal(loadChatState(storage), null)
  assert.equal(storage.getItem(CHAT_STORAGE_KEY), null)
})

test('invalid stored conversation records are ignored without breaking valid history', () => {
  const storage = new MemoryStorage()
  storage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
    version: 1,
    activeId: 'valid',
    conversations: [
      { id: 'bad', title: 'Bad record', messages: 'not a list' },
      { id: 'valid', title: 'Good record', messages: [{ id: 'm1', role: 'user', content: 'Hi', apiKey: 'discard' }] },
    ],
  }))

  const restored = loadChatState(storage)

  assert.equal(restored.activeId, 'valid')
  assert.equal(restored.conversations.length, 1)
  assert.equal('apiKey' in restored.conversations[0].messages[0], false)
})

test('PDF attachments stay on their conversation and metadata excludes extracted text', () => {
  const storage = new MemoryStorage()
  const first = createConversation()
  const second = createConversation()
  const document = {
    documentId: 'doc-1', filename: 'brief.pdf', pageCount: 3,
    characterCount: 18, extractedText: 'private extracted text',
  }
  const attached = attachDocumentToConversation([first, second], first.id, document)

  saveChatState(attached, first.id, storage)
  const raw = storage.getItem(CHAT_STORAGE_KEY)
  const restored = loadChatState(storage)

  assert.equal(raw.includes('private extracted text'), false)
  assert.deepEqual(restored.conversations[0].documents, [{
    documentId: 'doc-1', filename: 'brief.pdf', pageCount: 3, characterCount: 18,
  }])
  assert.deepEqual(restored.conversations[1].documents, [])
  assert.deepEqual(removeDocumentFromConversation(attached, first.id, 'doc-1')[0].documents, [])
})
