import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard.jsx'

export default function AnalyticsMetricCard({ item, index }) {
  const Icon = item.icon
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
      <GlassCard className="h-full p-4 sm:p-5">
        <div className="flex items-start justify-between"><span className="text-[10px] text-slate-500">{item.label}</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.045] text-nexus-cyan"><Icon size={15} /></span></div>
        <div className="mt-3 flex items-baseline gap-2"><span className="text-2xl font-semibold text-white">{item.value}</span><span className="text-[9px] font-medium text-emerald-400">{item.change}</span></div>
        <p className="mt-1 text-[9px] text-slate-600">{item.note}</p>
      </GlassCard>
    </motion.div>
  )
}
