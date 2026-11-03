import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function PromptResponse({ prompt, response, state }) {
  if (state === 'idle' || !prompt) return null

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-7 w-full max-w-2xl text-left" aria-live="polite">
      <div className="mb-3 flex items-center justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-white/[0.08] bg-white/[0.045] px-4 py-3 text-sm leading-6 text-slate-300">{prompt}</div>
      </div>
      <GlassCard className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-nexus-cyan">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-nexus-cyan/10"><Sparkles size={13} /></span>
          NEXUS
          {state === 'thinking' ? <span className="ml-auto flex items-center gap-1.5 text-nexus-muted"><span className="flex gap-1"><i className="h-1 w-1 animate-bounce rounded-full bg-nexus-cyan [animation-delay:-0.2s]" /><i className="h-1 w-1 animate-bounce rounded-full bg-nexus-cyan [animation-delay:-0.1s]" /><i className="h-1 w-1 animate-bounce rounded-full bg-nexus-cyan" /></span>Thinking</span> : <span className="ml-auto flex items-center gap-1 text-emerald-400"><Check size={13} /> Responded</span>}
        </div>
        {state === 'thinking' ? (
          <div className="space-y-2.5 py-1" aria-label="Generating response">
            <Skeleton className="h-2 w-[92%]" />
            <Skeleton className="h-2 w-[78%]" />
            <Skeleton className="h-2 w-[58%]" />
          </div>
        ) : (
          <p className="text-sm leading-7 text-slate-300">{response}</p>
        )}
      </GlassCard>
    </motion.section>
  )
}
