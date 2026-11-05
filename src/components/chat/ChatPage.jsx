import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Sparkles } from 'lucide-react'
import { getConversationContext, initialConversations } from '../../data/chatData.js'
import ChatHistoryPanel from './ChatHistoryPanel.jsx'
import ChatMessage from './ChatMessage.jsx'
import ChatTypingIndicator from './TypingIndicator.jsx'
import ChatComposer from './ChatComposer.jsx'
import ChatEmptyState from './ChatEmptyState.jsx'
import useSettingsPreferences from '../../hooks/useSettingsPreferences.js'
import { sendChatMessage, uploadPdf } from '../../lib/api.js'
import {
  deleteConversationDocuments,
  deleteStoredDocument,
  getConversationDocumentContext,
  loadConversationDocuments,
  saveExtractedDocument,
} from '../../lib/documentStorage.js'
import {
  appendConversationMessage,
  attachDocumentToConversation,
  createConversation,
  deleteConversation,
  loadChatState,
  makeConversationTitle,
  renameConversation,
  removeDocumentFromConversation,
  saveChatState,
} from '../../lib/chatStorage.js'

export default function ChatPage() {
  const [preferences] = useSettingsPreferences()
  const initialChatStateRef = useRef(null)
  if (initialChatStateRef.current === null) {
    const saved = loadChatState()
    initialChatStateRef.current = saved
      ? { ...saved, restored: true }
      : { conversations: initialConversations, activeId: initialConversations[0]?.id ?? null, restored: false }
  }
  const [conversations, setConversations] = useState(initialChatStateRef.current.conversations)
  const [activeId, setActiveId] = useState(initialChatStateRef.current.activeId)
  const [typingId, setTypingId] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const requestControllerRef = useRef(null)
  const pendingUploadsRef = useRef(new Map())
  const messageEndRef = useRef(null)
  const persistenceEnabledRef = useRef(initialChatStateRef.current.restored)
  const firstConversationsRef = useRef(conversations)
  const firstActiveIdRef = useRef(activeId)
  const activeConversation = conversations.find((conversation) => conversation.id === activeId)
  const messages = activeConversation?.messages ?? []
  const isTyping = typingId === activeId

  useEffect(() => () => {
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    pendingUploadsRef.current.forEach(({ controller }) => controller.abort())
  }, [])
  useEffect(() => {
    if (conversations === firstConversationsRef.current && activeId === firstActiveIdRef.current) return
    if (persistenceEnabledRef.current) saveChatState(conversations, activeId)
  }, [conversations, activeId])
  useEffect(() => {
    let cancelled = false
    const conversationsWithDocuments = conversations.filter((conversation) => conversation.documents?.length)
    if (!conversationsWithDocuments.length) return undefined

    Promise.all(conversationsWithDocuments.map(async (conversation) => [
      conversation.id,
      await loadConversationDocuments(conversation.id),
    ])).then((entries) => {
      if (cancelled) return
      const storedByConversation = new Map(entries)
      setConversations((current) => current.map((conversation) => {
        const records = storedByConversation.get(conversation.id)
        if (!records) return conversation
        const byId = new Map(records.map((document) => [document.documentId, document]))
        return {
          ...conversation,
          documents: (conversation.documents ?? []).map((metadata) => {
            const stored = byId.get(metadata.documentId)
            return stored
              ? { ...metadata, extractedText: stored.extractedText, unavailable: false }
              : { ...metadata, unavailable: true }
          }),
        }
      }))
      if (entries.some(([conversationId, records]) => {
        const conversation = conversationsWithDocuments.find((item) => item.id === conversationId)
        return conversation?.documents.some((document) => !records.some((record) => record.documentId === document.documentId))
      })) {
        setUploadError('A saved PDF could not be restored from browser storage. Remove it and upload it again.')
      }
    }).catch(() => {
      if (cancelled) return
      setConversations((current) => current.map((conversation) => ({
        ...conversation,
        documents: (conversation.documents ?? []).map((document) => ({ ...document, unavailable: true })),
      })))
      setUploadError('Saved PDFs could not be opened. Browser document storage may be unavailable.')
    })

    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    if (!historyOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setHistoryOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [historyOpen])
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'end' })
  }, [messages.length, isTyping, activeId])

  const cancelPendingRequest = () => {
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    setTypingId(null)
  }

  const startNewChat = () => {
    cancelPendingRequest()
    const conversation = createConversation()
    persistenceEnabledRef.current = true
    setConversations((current) => [conversation, ...current])
    setActiveId(conversation.id)
    setHistoryOpen(false)
  }

  const selectConversation = (conversationId) => {
    if (conversationId !== activeId) cancelPendingRequest()
    setActiveId(conversationId)
    setHistoryOpen(false)
  }

  const renameChat = (conversationId) => {
    const conversation = conversations.find((item) => item.id === conversationId)
    if (!conversation) return
    const nextTitle = window.prompt('Rename conversation', conversation.title)
    if (nextTitle === null || !nextTitle.trim()) return
    persistenceEnabledRef.current = true
    setConversations((current) => renameConversation(current, conversationId, nextTitle))
  }

  const deleteChat = async (conversationId) => {
    const conversation = conversations.find((item) => item.id === conversationId)
    if (!conversation || !window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return
    persistenceEnabledRef.current = true
    if (conversationId === activeId) cancelPendingRequest()
    const pendingUpload = pendingUploadsRef.current.get(conversationId)
    pendingUpload?.controller.abort()
    if (pendingUpload?.promise) await Promise.allSettled([pendingUpload.promise])
    if (conversation.documents?.length || pendingUpload) {
      try {
        await deleteConversationDocuments(conversationId)
      } catch (error) {
        setUploadError(error.message || 'Saved PDF data could not be deleted. Please try again.')
        return
      }
    }
    if (conversationId === activeId) {
      setActiveId(conversations.find((item) => item.id !== conversationId)?.id ?? null)
    }
    setConversations((current) => deleteConversation(current, conversationId))
  }

  const uploadDocument = async (file) => {
    const conversationId = activeId
    if (!conversationId || !activeConversation || pendingUploadsRef.current.size > 0) return
    setUploadError('')
    if (!file.name?.toLowerCase().endsWith('.pdf')) {
      setUploadError('Choose a PDF file to attach.')
      return
    }
    if (file.type && !['application/pdf', 'application/octet-stream'].includes(file.type)) {
      setUploadError('This file is not identified as a PDF. Choose a PDF file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('PDF uploads are limited to 10 MB.')
      return
    }
    if ((activeConversation.documents ?? []).length >= 3) {
      setUploadError('A maximum of three PDFs can be attached to one conversation.')
      return
    }

    const controller = new AbortController()
    const pending = { controller, promise: null }
    pendingUploadsRef.current.set(conversationId, pending)
    setUploadProgress({ conversationId, filename: file.name, percent: 0 })
    pending.promise = (async () => {
      try {
        const result = await uploadPdf(file, {
          signal: controller.signal,
          onProgress: (percent) => setUploadProgress({ conversationId, filename: file.name, percent }),
        })
        const document = {
          documentId: result.document_id,
          filename: result.filename,
          pageCount: result.page_count,
          characterCount: result.character_count,
          extractedText: result.extracted_text,
          unavailable: false,
        }
        await saveExtractedDocument(conversationId, document)
        if (controller.signal.aborted) {
          await deleteStoredDocument(conversationId, document.documentId)
          return
        }
        persistenceEnabledRef.current = true
        setConversations((current) => attachDocumentToConversation(current, conversationId, document))
        setUploadError('')
      } catch (error) {
        if (!controller.signal.aborted) {
          setUploadError(error.message || 'PDF upload or browser storage failed. Please try again.')
        }
      } finally {
        if (pendingUploadsRef.current.get(conversationId) === pending) {
          pendingUploadsRef.current.delete(conversationId)
        }
        setUploadProgress((current) => current?.conversationId === conversationId ? null : current)
      }
    })()
    await pending.promise
  }

  const removeDocument = async (document) => {
    const conversationId = activeId
    if (!conversationId) return
    try {
      await deleteStoredDocument(conversationId, document.documentId)
      setConversations((current) => removeDocumentFromConversation(current, conversationId, document.documentId))
      setUploadError('')
    } catch (error) {
      setUploadError(error.message || 'This PDF could not be removed from browser storage.')
    }
  }

  const sendMessage = async (content) => {
    if (!activeConversation || typingId !== null || requestControllerRef.current) return
    const conversationId = activeId
    const history = getConversationContext(activeConversation.messages)
    persistenceEnabledRef.current = true
    const controller = new AbortController()
    requestControllerRef.current = controller
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMessage = { id: `message-${Date.now()}`, role: 'user', content, time: now }
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? {
          ...conversation,
          isDemo: false,
          title: !conversation.titleIsCustom && !conversation.messages.some((item) => !item.isDemo && item.role === 'user')
          ? makeConversationTitle(content)
          : conversation.title,
          updated: 'Just now',
          messages: [...conversation.messages, userMessage],
        }
      : conversation))
    setTypingId(conversationId)
    try {
      const documentContext = await getConversationDocumentContext(
        conversationId,
        activeConversation.documents ?? [],
      )
      if (requestControllerRef.current !== controller || controller.signal.aborted) return
      const reply = await sendChatMessage(content, {
        history,
        documentContext,
        signal: controller.signal,
      })
      if (requestControllerRef.current !== controller || controller.signal.aborted) return
      const assistantMessage = {
        id: `message-${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }
      setConversations((current) => appendConversationMessage(current, conversationId, assistantMessage))
    } catch (error) {
      if (requestControllerRef.current !== controller || controller.signal.aborted) return
      const assistantMessage = {
        id: `message-${Date.now()}-assistant-error`,
        role: 'assistant',
        content: error.message || 'NEXUS could not get a response right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        isError: true,
      }
      setConversations((current) => appendConversationMessage(current, conversationId, assistantMessage))
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null
        setTypingId(null)
      }
    }
  }

  return (
    <section className="relative flex h-[calc(100dvh-205px)] min-h-[360px] w-full min-w-0 gap-3 overflow-hidden sm:gap-4 md:h-[calc(100dvh-145px)] md:min-h-[420px]">
      <div className="hidden w-[260px] shrink-0 lg:block">
        <ChatHistoryPanel conversations={conversations} activeId={activeId} onSelect={selectConversation} onNewChat={startNewChat} onRename={renameChat} onDelete={deleteChat} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0c18]/75 shadow-glass backdrop-blur-xl">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-white/[0.06] px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <button type="button" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen} aria-label={historyOpen ? 'Close chat history' : 'Open chat history'} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.07] text-slate-500 transition hover:bg-white/[0.05] hover:text-white lg:hidden"><History size={16} /></button>
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-nexus-cyan/15 bg-nexus-cyan/[0.07] text-nexus-cyan"><Sparkles size={13} /></div>
            <div className="min-w-0"><h1 className="truncate text-[11px] font-medium text-slate-200 sm:text-xs">{activeConversation?.title ?? 'New conversation'}</h1><p className="mt-0.5 text-[9px] text-slate-600">NEXUS assistant · Gemini</p></div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-2 py-1 text-[9px] text-emerald-300/80 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Ready</span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }} className={`mx-auto flex w-full max-w-3xl flex-col gap-5 ${messages.length ? 'py-5 sm:py-7' : 'h-full'}`}>
              {messages.length === 0 ? (
                <ChatEmptyState onSuggest={sendMessage} />
              ) : (
                <>
                  {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                  {isTyping && <ChatTypingIndicator />}
                </>
              )}
              <div ref={messageEndRef} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shrink-0 border-t border-white/[0.05] bg-[#090b17]/70 px-3 pb-3 pt-3 sm:px-5 sm:pb-4">
          <div className="mx-auto w-full max-w-3xl"><ChatComposer onSend={sendMessage} disabled={typingId !== null || !activeConversation} uploading={Boolean(uploadProgress)} enterToSend={preferences.general.enterToSend} documents={activeConversation?.documents ?? []} uploadProgress={uploadProgress?.conversationId === activeId ? uploadProgress : null} uploadError={uploadError} onUpload={uploadDocument} onRemoveDocument={removeDocument} /><p className="mt-2 text-center text-[9px] text-slate-700">Gemini responses may not always be accurate.</p></div>
        </div>
      </div>

      <AnimatePresence>
        {historyOpen && <>
          <motion.button type="button" aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div role="dialog" aria-modal="true" aria-label="Chat history" initial={{ x: -290 }} animate={{ x: 0 }} exit={{ x: -290 }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed inset-y-0 left-0 z-50 w-[min(290px,calc(100vw-2rem))] bg-[#080a17] pb-[env(safe-area-inset-bottom)] shadow-2xl lg:hidden">
            <ChatHistoryPanel mobile conversations={conversations} activeId={activeId} onSelect={selectConversation} onNewChat={startNewChat} onClose={() => setHistoryOpen(false)} onRename={renameChat} onDelete={deleteChat} />
          </motion.div>
        </>}
      </AnimatePresence>
    </section>
  )
}
