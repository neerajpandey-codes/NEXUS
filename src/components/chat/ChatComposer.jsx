import { useRef, useState } from 'react'
import { ArrowUp, Paperclip, X } from 'lucide-react'

export default function ChatComposer({
  onSend,
  disabled,
  enterToSend = true,
  documents = [],
  uploadProgress,
  uploading = false,
  uploadError,
  onUpload,
  onRemoveDocument,
}) {
  const [value, setValue] = useState('')
  const fileInputRef = useRef(null)

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
        {documents.length > 0 && <div className="mb-2 flex flex-wrap gap-2" aria-label="Attached PDF documents">
          {documents.map((document) => <span key={document.documentId} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-slate-300">
            <span className="max-w-[180px] truncate" title={document.filename}>{document.filename}</span>
            <span className="shrink-0 text-slate-600">{document.unavailable ? 'Re-upload required' : `${document.pageCount} pages`}</span>
            <button type="button" onClick={() => onRemoveDocument?.(document)} aria-label={`Remove ${document.filename}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white/5 hover:text-rose-300"><X size={13} /></button>
          </span>)}
        </div>}
        <label htmlFor="chat-message" className="sr-only">Message NEXUS</label>
        <textarea id="chat-message" rows={2} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => {
          if (enterToSend && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() }
        }} disabled={disabled} placeholder="Message NEXUS..." className="max-h-32 min-h-[48px] w-full resize-y border-0 bg-transparent px-1 py-1 text-[12px] leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:ring-0 disabled:opacity-60 sm:text-[13px]" />
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="sr-only" aria-label="Choose a PDF document" onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onUpload?.(file)
            event.target.value = ''
          }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading} title="Attach a PDF document" aria-label="Attach a PDF document" className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-nexus-cyan disabled:cursor-not-allowed disabled:opacity-40"><Paperclip size={16} /></button>
          <div className="flex items-center gap-3"><span className="hidden text-[9px] text-slate-600 sm:block">{enterToSend ? 'Enter to send · Shift + Enter for a new line' : 'Use the send button to send'}</span><button type="submit" aria-label="Send message" disabled={disabled || !value.trim()} className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-nexus-purple to-indigo-500 text-white shadow-[0_4px_18px_rgba(99,102,241,.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={18} /></button></div>
        </div>
        {uploadProgress && <p role="status" className="mt-2 px-1 text-[10px] text-nexus-cyan/80">{uploadProgress.percent < 100 ? `Uploading ${uploadProgress.filename} - ${uploadProgress.percent}%` : `Extracting text from ${uploadProgress.filename}...`}</p>}
        {uploadError && <p role="alert" className="mt-2 px-1 text-[10px] text-rose-300">{uploadError}</p>}
      </div>
    </form>
  )
}
