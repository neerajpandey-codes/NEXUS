import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Sparkles } from 'lucide-react'
import { initialConversations } from '../../data/chatData.js'
import ChatHistoryPanel from './ChatHistoryPanel.jsx'
import ChatMessage from './ChatMessage.jsx'
import ChatTypingIndicator from './TypingIndicator.jsx'
import ChatComposer from './ChatComposer.jsx'
import ChatEmptyState from './ChatEmptyState.jsx'
import useSettingsPreferences from '../../hooks/useSettingsPreferences.js'
import { sendChatMessage } from '../../lib/api.js'

const makeConversation = () => ({
  id: `conversation-${Date.now()}`,
  title: 'New conversation',
  updated: 'Just now',
  messages: [],
})

export default function ChatPage() {
  const [preferences] = useSettingsPreferences()
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(initialConversations[0].id)
  const [typingId, setTypingId] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const requestControllerRef = useRef(null)
  const messageEndRef = useRef(null)
  const activeConversation = conversations.find((conversation) => conversation.id === activeId)
  const messages = activeConversation?.messages ?? []
  const isTyping = typingId === activeId

  useEffect(() => () => {
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
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
    const conversation = makeConversation()
    setConversations((current) => [conversation, ...current])
    setActiveId(conversation.id)
    setHistoryOpen(false)
  }

  const selectConversation = (conversationId) => {
    if (conversationId !== activeId) cancelPendingRequest()
    setActiveId(conversationId)
    setHistoryOpen(false)
  }

  const sendMessage = async (content) => {
    if (!activeConversation || typingId !== null || requestControllerRef.current) return
    const conversationId = activeId
    const controller = new AbortController()
    requestControllerRef.current = controller
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMessage = { id: `message-${Date.now()}`, role: 'user', content, time: now }
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? {
          ...conversation,
          title: conversation.messages.length === 0 ? (content.length > 34 ? `${content.slice(0, 34).trim()}…` : content) : conversation.title,
          updated: 'Just now',
          messages: [...conversation.messages, userMessage],
        }
      : conversation))
    setTypingId(conversationId)
    try {
      const reply = await sendChatMessage(content, { signal: controller.signal })
      if (requestControllerRef.current !== controller || controller.signal.aborted) return
      const assistantMessage = {
        id: `message-${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }
      setConversations((current) => current.map((conversation) => conversation.id === conversationId
        ? { ...conversation, updated: 'Just now', messages: [...conversation.messages, assistantMessage] }
        : conversation))
    } catch (error) {
      if (requestControllerRef.current !== controller || controller.signal.aborted) return
      const assistantMessage = {
        id: `message-${Date.now()}-assistant-error`,
        role: 'assistant',
        content: error.message || 'NEXUS could not get a response right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        isError: true,
      }
      setConversations((current) => current.map((conversation) => conversation.id === conversationId
        ? { ...conversation, messages: [...conversation.messages, assistantMessage] }
        : conversation))
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
        <ChatHistoryPanel conversations={conversations} activeId={activeId} onSelect={selectConversation} onNewChat={startNewChat} />
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
          <div className="mx-auto w-full max-w-3xl"><ChatComposer onSend={sendMessage} disabled={typingId !== null} enterToSend={preferences.general.enterToSend} /><p className="mt-2 text-center text-[9px] text-slate-700">Gemini responses may not always be accurate.</p></div>
        </div>
      </div>

      <AnimatePresence>
        {historyOpen && <>
          <motion.button type="button" aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div role="dialog" aria-modal="true" aria-label="Chat history" initial={{ x: -290 }} animate={{ x: 0 }} exit={{ x: -290 }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed inset-y-0 left-0 z-50 w-[min(290px,calc(100vw-2rem))] bg-[#080a17] pb-[env(safe-area-inset-bottom)] shadow-2xl lg:hidden">
            <ChatHistoryPanel mobile conversations={conversations} activeId={activeId} onSelect={selectConversation} onNewChat={startNewChat} onClose={() => setHistoryOpen(false)} />
          </motion.div>
        </>}
      </AnimatePresence>
    </section>
  )
}
