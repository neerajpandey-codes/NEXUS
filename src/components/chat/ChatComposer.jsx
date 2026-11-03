import { useState } from 'react'
import { ArrowUp, Paperclip } from 'lucide-react'

export default function ChatComposer({ onSend, disabled, enterToSend = true }) {
  const [value, setValue] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const message = value.trim()
    if (!message || disabled) return
    onSend(message)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-gradient-to-br from-nexus-cyan/30 via-nexus-purple/35 to-white/10 p-px shadow-[0_12px_44px_rgba(99,102,241,.12)] focus-within:shadow-[0_12px_50px_rgba(99,102,241,.2)]">
      <div className="rounded-2xl bg-[#0a0c1a]/95 p-3 sm:p-3.5">
        <label htmlFor="chat-message" className="sr-only">Message NEXUS</label>
        <textarea id="chat-message" rows={2} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => {
          if (enterToSend && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() }
        }} disabled={disabled} placeholder="Message NEXUS..." className="max-h-32 min-h-[48px] w-full resize-y border-0 bg-transparent px-1 py-1 text-[12px] leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:ring-0 disabled:opacity-60 sm:text-[13px]" />
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <button type="button" disabled title="File attachments are not available in this frontend demo" aria-label="File attachments are coming soon" className="grid h-11 w-11 cursor-not-allowed place-items-center rounded-lg text-slate-600/60"><Paperclip size={16} /></button>
          <div className="flex items-center gap-3"><span className="hidden text-[9px] text-slate-600 sm:block">{enterToSend ? 'Enter to send · Shift + Enter for a new line' : 'Use the send button to send'}</span><button type="submit" aria-label="Send message" disabled={disabled || !value.trim()} className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-nexus-purple to-indigo-500 text-white shadow-[0_4px_18px_rgba(99,102,241,.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={18} /></button></div>
        </div>
      </div>
    </form>
  )
}
