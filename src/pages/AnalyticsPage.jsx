import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Clock3, Coins, Gauge, MessageSquareText, ShieldCheck } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import AnalyticsMetricCard from '../components/analytics/AnalyticsMetricCard.jsx'
import UsageChart from '../components/analytics/UsageChart.jsx'
import { analyticsModels, analyticsWindows } from '../data/phase7Data.js'

const metricIcons = [MessageSquareText, Clock3, Gauge, Coins]

export default function AnalyticsPage() {
  const [range, setRange] = useState('30 days')
  const items = [
    { label: 'Total prompts', value: analyticsWindows[range].total, change: analyticsWindows[range].change, note: `Across the last ${range}`, icon: metricIcons[0] },
    { label: 'Avg. response time', value: '428 ms', change: '−8.4%', note: 'Faster than previous period', icon: metricIcons[1] },
    { label: 'Successful requests', value: '99.8%', change: '+0.3%', note: 'Service availability', icon: metricIcons[2] },
    { label: 'Estimated savings', value: '36.5h', change: '+11.2%', note: 'Time returned to your team', icon: metricIcons[3] },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nexus-cyan/70">Workspace intelligence</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Analytics</h2><p className="mt-2 text-xs text-nexus-muted">Understand how your team works with AI.</p></div><div className="flex items-center gap-2 self-start rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[9px] text-slate-500 sm:self-auto"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Mock data · Updated just now</div></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{items.map((item, index) => <AnalyticsMetricCard key={item.label} item={item} index={index} />)}</div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.65fr_1fr]">
        <UsageChart range={range} onRangeChange={setRange} />
        <GlassCard className="p-4 sm:p-5">
          <div className="mb-5"><h3 className="text-sm font-medium text-slate-100">Model usage</h3><p className="mt-1 text-[10px] text-slate-500">Share of prompts by model · {range.toLowerCase()}</p></div>
          <div className="space-y-4">{analyticsModels.map((model, index) => <div key={model.name}><div className="mb-2 flex items-center justify-between gap-2 text-[10px]"><span className="truncate text-slate-300">{model.name}</span><span className="shrink-0 text-slate-500">{model.prompts} <span className="ml-1 text-slate-600">{model.share}%</span></span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${model.share}%`, backgroundColor: model.color, boxShadow: `0 0 12px ${model.color}55`, transitionDelay: `${index * 80}ms` }} /></div></div>)}</div>
          <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[9px] leading-4 text-slate-600"><ShieldCheck size={13} className="shrink-0 text-emerald-400" />Usage breakdown is sample data for this workspace.</div>
        </GlassCard>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassCard className="flex items-center gap-4 p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-nexus-purple/10 text-nexus-purple"><Clock3 size={17} /></span><div className="min-w-0 flex-1"><div className="text-[10px] text-slate-500">Average daily usage</div><div className="mt-1 text-lg font-semibold text-white">{analyticsWindows[range].average} <span className="text-[10px] font-normal text-slate-500">prompts / day</span></div></div><span className="flex items-center gap-1 text-[9px] text-emerald-400"><ArrowUpRight size={12} />11%</span></GlassCard>
        <GlassCard className="flex items-center gap-4 p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Gauge size={17} /></span><div className="min-w-0 flex-1"><div className="text-[10px] text-slate-500">Reliability trend</div><div className="mt-1 text-lg font-semibold text-white">99.8% <span className="text-[10px] font-normal text-slate-500">successful runs</span></div></div><span className="flex items-center gap-1 text-[9px] text-slate-500"><ArrowDownRight size={12} />0.2% errors</span></GlassCard>
      </div>
    </div>
  )
}
