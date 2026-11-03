import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard.jsx'

export default function SettingsSection({ icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
      <div className="mb-3 flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-nexus-cyan"><Icon size={15} /></span><div><h2 className="text-xs font-medium text-slate-100">{title}</h2><p className="mt-0.5 text-[9px] text-slate-600">{description}</p></div></div>
      <GlassCard className="divide-y divide-white/[0.06] px-4 sm:px-5">{children}</GlassCard>
    </motion.section>
  )
}
