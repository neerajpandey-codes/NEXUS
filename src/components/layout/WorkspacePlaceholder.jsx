import { Activity, ArrowUpRight, Command, Sparkles } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'

export default function WorkspacePlaceholder({ page }) {
  return (
    <section className="flex min-h-[calc(100vh-145px)] flex-col items-center justify-center py-12 text-center">
      <div className="mb-7 flex items-center gap-2 rounded-full border border-nexus-cyan/15 bg-nexus-cyan/[0.045] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-nexus-cyan/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Foundation online
      </div>
      <div className="relative mb-7 grid h-24 w-24 place-items-center rounded-[28px] border border-white/10 bg-white/[0.035] text-nexus-cyan shadow-[0_0_70px_rgba(99,102,241,0.13)]">
        <div className="absolute inset-2 rounded-[22px] border border-nexus-purple/15" />
        <Command size={35} strokeWidth={1.3} />
        <Sparkles size={14} className="absolute -right-1 -top-1 text-nexus-purple" />
      </div>
      <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-nexus-cyan/75">AI Command Center</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{page === 'Dashboard' ? 'Welcome to NEXUS' : `${page} workspace`}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-nexus-muted">Your workspace shell is ready. This area is reserved for the next implementation phase.</p>
      <GlassCard className="mt-9 flex w-full max-w-[460px] items-center gap-4 p-4 text-left sm:p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-nexus-purple/10 text-nexus-purple"><Activity size={18} /></div>
        <div className="min-w-0 flex-1"><div className="text-xs font-medium text-slate-200">System status</div><div className="mt-1 text-[11px] text-slate-500">All core systems are operational</div></div>
        <ArrowUpRight size={15} className="text-slate-600" />
      </GlassCard>
      <div className="mt-7 flex items-center gap-2 text-[10px] text-slate-600"><span className="h-px w-8 bg-white/10" />Phase 3 · Main application layout<span className="h-px w-8 bg-white/10" /></div>
    </section>
  )
}
