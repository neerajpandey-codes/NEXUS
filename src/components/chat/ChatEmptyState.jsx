import { motion } from 'framer-motion'
import { Command, Sparkles } from 'lucide-react'
import { suggestedPrompts } from '../../data/chatData.js'

export default function ChatEmptyState({ onSuggest }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-5 grid h-16 w-16 place-items-center rounded-[22px] border border-nexus-cyan/15 bg-gradient-to-br from-nexus-cyan/[0.1] to-nexus-purple/[0.1] text-nexus-cyan shadow-[0_0_44px_rgba(99,102,241,.12)]">
        <Command size={27} strokeWidth={1.5} /><Sparkles size={12} className="absolute -right-1 -top-1 text-nexus-purple" />
      </motion.div>
      <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-nexus-cyan/70">A little more clarity starts here</p>
      <h2 className="mt-2 text-xl font-medium text-white sm:text-2xl">What can I help you with?</h2>
      <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-500">Explore an idea, work through a challenge, or turn a rough thought into a plan.</p>
      <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-3">
        {suggestedPrompts.map((prompt, index) => <motion.button key={prompt} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ delay: 0.1 + index * 0.07 }} type="button" onClick={() => onSuggest(prompt)} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-left text-[10px] leading-4 text-slate-400 transition hover:border-nexus-purple/25 hover:bg-nexus-purple/[0.06] hover:text-slate-200">{prompt}</motion.button>)}
      </div>
    </div>
  )
}
