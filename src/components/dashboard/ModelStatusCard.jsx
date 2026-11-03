import { motion } from 'framer-motion'
import { ArrowUpRight, Cpu, Gauge } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { modelStatuses } from '../../data/dashboardData.js'

export default function ModelStatusCard({ onNavigate }) {
  return (
    <GlassCard className="h-full overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-nexus-cyan/10 text-nexus-cyan"><Cpu size={17} /></span><div><h3 className="text-sm font-medium text-slate-100">Model status</h3><p className="mt-1 text-[11px] text-slate-500">Connected intelligence</p></div></div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[9px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />All systems normal</span>
      </div>
      <div className="divide-y divide-white/[0.055]">
        {modelStatuses.map((model, index) => (
          <motion.div key={model.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 + index * 0.08 }} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-[10px] font-semibold text-slate-300">{model.provider.slice(0, 1)}<span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#101221] bg-emerald-400" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium text-slate-300">{model.name}</span><span className="mt-1 block text-[9px] text-slate-600">{model.provider}</span></span>
            <span className="flex items-center gap-1 text-[9px] text-slate-500"><Gauge size={11} className="text-emerald-400/70" />{model.latency}</span>
          </motion.div>
        ))}
      </div>
      <button type="button" onClick={() => onNavigate('Models')} className="mt-4 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 text-[10px] text-slate-500 transition hover:border-nexus-cyan/20 hover:text-nexus-cyan">Manage models<ArrowUpRight size={12} /></button>
    </GlassCard>
  )
}
