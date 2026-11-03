import { motion } from 'framer-motion'
import { AlertCircle, Check, Command, Copy, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === 'assistant'

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.article initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.24 }} className={`flex gap-3 ${isAssistant ? 'items-start' : 'flex-row-reverse items-start'}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${isAssistant ? 'border-nexus-cyan/15 bg-nexus-cyan/[0.08] text-nexus-cyan' : 'border-nexus-purple/20 bg-nexus-purple/[0.14] text-purple-200'}`}>
        {isAssistant ? <Command size={15} /> : <span className="text-[10px] font-semibold">AM</span>}
      </span>
      <div className={`group max-w-[88%] sm:max-w-[78%] ${isAssistant ? '' : 'text-right'}`}>
        <div className={`mb-1.5 flex items-center gap-2 text-[10px] ${isAssistant ? 'text-nexus-cyan/80' : 'justify-end text-slate-500'}`}>
          <span>{isAssistant ? 'NEXUS' : 'You'}</span><span className="text-slate-700">{message.time ?? 'Now'}</span>
        </div>
        <div className={`inline-block whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-[12px] leading-6 sm:text-[13px] ${isAssistant ? message.isError ? 'rounded-tl-sm border border-rose-400/20 bg-rose-400/[0.06] text-rose-200 shadow-[0_8px_28px_rgba(0,0,0,.12)]' : 'rounded-tl-sm border border-white/[0.07] bg-white/[0.045] text-slate-300 shadow-[0_8px_28px_rgba(0,0,0,.12)]' : 'rounded-tr-sm border border-nexus-purple/20 bg-gradient-to-br from-nexus-purple/20 to-indigo-500/10 text-slate-100'}`}>
          {isAssistant && (message.isError ? <AlertCircle size={13} className="mb-2 text-rose-300" /> : <Sparkles size={13} className="mb-2 text-nexus-cyan/80" />)}
          {message.content}
        </div>
        {isAssistant && <button type="button" onClick={copyMessage} aria-label={copied ? 'Copied response' : 'Copy response'} className="mt-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-[9px] text-slate-600 opacity-100 transition hover:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100">{copied ? <Check size={11} /> : <Copy size={11} />}{copied ? 'Copied' : 'Copy'}</button>}
      </div>
    </motion.article>
  )
}
