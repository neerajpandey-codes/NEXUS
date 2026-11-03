import { useState } from 'react'
import { ArrowUp, Paperclip, Sparkles } from 'lucide-react'

const suggestions = ['Summarize a document', 'Help me brainstorm', 'Explain a complex topic']

export default function PromptInput({ onSubmit, disabled }) {
  const [prompt, setPrompt] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const value = prompt.trim()
    if (!value || disabled) return
    onSubmit(value)
    setPrompt('')
  }

  const useSuggestion = (suggestion) => {
    setPrompt(suggestion)
  }

  return (
    <div className="w-full">
      <form onSubmit={submit} className="group rounded-2xl bg-gradient-to-br from-nexus-cyan/35 via-nexus-purple/35 to-white/10 p-px shadow-[0_15px_60px_rgba(99,102,241,0.13)] transition-shadow focus-within:shadow-[0_15px_70px_rgba(99,102,241,0.24)]">
        <div className="rounded-2xl bg-[#0a0c1a]/95 p-3 sm:p-4">
          <label htmlFor="nexus-prompt" className="sr-only">Ask NEXUS anything</label>
          <textarea
            id="nexus-prompt"
            rows={2}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask anything, or describe what you need..."
            disabled={disabled}
            className="max-h-36 min-h-[56px] w-full resize-y border-0 bg-transparent px-1 py-1 text-sm leading-6 text-nexus-text outline-none placeholder:text-slate-600 focus:ring-0 disabled:opacity-60 sm:text-[15px]"
          />
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] pt-3">
            <button type="button" disabled title="File attachments are not available in this frontend demo" className="flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-slate-500/60" aria-label="File attachments are coming soon">
              <Paperclip size={14} /> <span className="hidden sm:inline">Attach</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden text-[10px] text-slate-600 sm:block">AI responses are simulated</span>
              <button type="submit" disabled={disabled || !prompt.trim()} aria-label="Send prompt" className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-nexus-purple to-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                <ArrowUp size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 flex items-center gap-1 text-[10px] text-slate-600"><Sparkles size={11} /> Try</span>
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" disabled={disabled} onClick={() => useSuggestion(suggestion)} className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-slate-500 transition hover:border-nexus-purple/30 hover:text-slate-300 disabled:opacity-50 sm:text-[11px]">
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
