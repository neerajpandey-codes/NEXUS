import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard.jsx'

const tones = {
  cyan: 'bg-nexus-cyan/10 text-nexus-cyan shadow-[0_0_24px_rgba(34,211,238,.08)]',
  purple: 'bg-nexus-purple/10 text-nexus-purple shadow-[0_0_24px_rgba(139,92,246,.08)]',
  blue: 'bg-indigo-400/10 text-indigo-300 shadow-[0_0_24px_rgba(129,140,248,.08)]',
  green: 'bg-emerald-400/10 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,.08)]',
}

export default function StatCard({ stat, index }) {
  const Icon = stat.icon

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
      <GlassCard className="group relative h-full overflow-hidden p-4 transition-colors duration-300 hover:border-white/[0.14] sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-nexus-purple/[0.06] blur-2xl transition-opacity group-hover:opacity-150" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-nexus-muted sm:text-xs">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{stat.value}</p>
          </div>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[stat.tone]}`}><Icon size={17} strokeWidth={1.8} /></span>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px]">
          <span className="font-medium text-emerald-400">{stat.change}</span>
          <span className="text-slate-600">{stat.detail}</span>
        </div>
      </GlassCard>
    </motion.div>
  )
}
