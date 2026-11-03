import { motion } from 'framer-motion'
import { ArrowUpRight, Clock3, MessageSquareText } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { recentPrompts } from '../../data/dashboardData.js'

const categoryStyles = {
  purple: 'bg-nexus-purple/10 text-purple-300',
  cyan: 'bg-nexus-cyan/10 text-cyan-300',
  blue: 'bg-indigo-400/10 text-indigo-300',
  green: 'bg-emerald-400/10 text-emerald-300',
}

export default function RecentPrompts({ onNavigate }) {
  return (
    <GlassCard className="h-full p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-nexus-purple/10 text-nexus-purple"><MessageSquareText size={16} /></span><div><h3 className="text-sm font-medium text-slate-100">Recent prompts</h3><p className="mt-1 text-[11px] text-slate-500">Pick up where you left off</p></div></div>
        <button type="button" onClick={() => onNavigate('AI Chat')} className="flex min-h-11 items-center gap-1 text-[10px] text-nexus-cyan/80 transition hover:text-nexus-cyan">View all<ArrowUpRight size={12} /></button>
      </div>
      <div className="divide-y divide-white/[0.055]">
        {recentPrompts.map((prompt, index) => (
          <motion.button key={prompt.title} type="button" onClick={() => onNavigate('AI Chat')} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + index * 0.06 }} whileHover={{ x: 3 }} whileTap={{ scale: 0.99 }} className="group flex min-h-11 w-full items-start gap-3 py-3 text-left first:pt-1 last:pb-0">
            <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${categoryStyles[prompt.color]}`}><MessageSquareText size={13} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium text-slate-300 transition group-hover:text-white sm:text-xs">{prompt.title}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-600"><span className={`rounded px-1.5 py-0.5 ${categoryStyles[prompt.color]}`}>{prompt.category}</span><span>{prompt.model}</span></span>
            </span>
            <span className="mt-1 flex shrink-0 items-center gap-1 text-[9px] text-slate-600"><Clock3 size={10} />{prompt.time}</span>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  )
}
