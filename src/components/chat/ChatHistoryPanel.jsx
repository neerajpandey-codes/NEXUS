import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, Search, X } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'

export default function ChatHistoryPanel({ conversations, activeId, onSelect, onNewChat, onClose, mobile = false }) {
  const [query, setQuery] = useState('')
  const visibleConversations = conversations.filter((conversation) => conversation.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <GlassCard className={`flex h-full min-h-0 flex-col overflow-hidden ${mobile ? 'rounded-none border-y-0 border-l-0' : 'rounded-2xl'}`}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <div><h2 className="text-xs font-medium text-slate-100">Your conversations</h2><p className="mt-1 text-[10px] text-slate-600">{conversations.length} saved chats</p></div>
        {mobile && <button type="button" onClick={onClose} aria-label="Close chat history" className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white"><X size={16} /></button>}
      </div>
      <button type="button" onClick={onNewChat} className="mx-3 mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-nexus-purple/25 bg-gradient-to-r from-nexus-purple/15 to-nexus-cyan/[0.06] px-3 py-2.5 text-xs font-medium text-slate-100 transition hover:border-nexus-purple/40 hover:from-nexus-purple/20">
        <Plus size={15} className="text-nexus-cyan" />New chat
      </button>
      <label className="mx-3 mt-3 flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] bg-black/10 px-2.5 text-slate-600 focus-within:border-nexus-purple/30">
        <Search size={13} /><input aria-label="Search conversations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" className="w-full bg-transparent text-[11px] text-slate-300 outline-none placeholder:text-slate-600" />
      </label>
      <p className="mb-2 mt-5 px-4 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">Recent</p>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {visibleConversations.map((conversation) => {
          const active = conversation.id === activeId
          const lastMessage = conversation.messages.at(-1)?.content ?? 'Start a new conversation'
          return (
            <motion.button key={conversation.id} type="button" layout whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }} onClick={() => { onSelect(conversation.id); onClose?.() }} className={`w-full min-h-11 rounded-xl px-3 py-3 text-left transition ${active ? 'border border-white/[0.07] bg-white/[0.055]' : 'border border-transparent hover:bg-white/[0.035]'}`}>
              <span className="flex items-start gap-2.5"><MessageSquare size={13} className={`mt-0.5 shrink-0 ${active ? 'text-nexus-cyan' : 'text-slate-600'}`} /><span className="min-w-0 flex-1"><span className={`block truncate text-[11px] font-medium ${active ? 'text-slate-100' : 'text-slate-400'}`}>{conversation.title}</span><span className="mt-1 block truncate text-[10px] text-slate-600">{lastMessage}</span><span className="mt-2 block text-[9px] text-slate-700">{conversation.updated}</span></span></span>
            </motion.button>
          )
        })}
        {visibleConversations.length === 0 && <p className="px-3 py-5 text-center text-[10px] text-slate-600">No matching conversations</p>}
      </div>
      <div className="border-t border-white/[0.06] px-4 py-3 text-[9px] leading-4 text-slate-600">Chat history is stored in this browser session only.</div>
    </GlassCard>
  )
}
