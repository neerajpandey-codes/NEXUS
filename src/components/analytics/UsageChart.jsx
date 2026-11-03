import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, MousePointer2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { analyticsWindows } from '../../data/phase7Data.js'

const width = 760
const height = 230
const pointsFor = (values) => values.map((value, index) => ({ x: 14 + (index / (values.length - 1)) * (width - 28), y: height - 18 - (value / 100) * (height - 38) }))
const pathFor = (points) => points.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')

export default function UsageChart({ range, onRangeChange }) {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(null)
  const series = analyticsWindows[range]
  const points = pointsFor(series.prompts)
  const line = pathFor(points)
  const area = `${line} L ${width - 14} ${height - 18} L 14 ${height - 18} Z`

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-medium text-slate-100">Usage over time</h3><p className="mt-1 text-[10px] text-slate-500">Prompt activity across all connected models</p></div><div className="flex rounded-lg border border-white/[0.06] bg-black/10 p-0.5" role="group" aria-label="Analytics time range">{Object.keys(analyticsWindows).map((item) => <button key={item} type="button" aria-pressed={range === item} onClick={() => { onRangeChange(item); setHovered(null) }} className={`min-h-10 rounded-md px-2.5 py-2 text-[9px] transition ${range === item ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}>{item}</button>)}</div></div>
      <div className="mb-3 flex items-end gap-2"><span className="text-2xl font-semibold text-white">{series.total}</span><span className="mb-1 flex items-center text-[10px] text-emerald-400"><ArrowUpRight size={13} />{series.change}</span><span className="mb-1 text-[9px] text-slate-600">total prompts</span></div>
      <div className="relative" onMouseLeave={() => setHovered(null)}>
        {hovered !== null && <div className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-white/10 bg-[#111426] px-2 py-1 text-[9px] text-white" style={{ left: `${Math.min(90, Math.max(10, points[hovered].x / width * 100))}%`, top: `${points[hovered].y / height * 100}%` }}>{series.prompts[hovered] * 13} prompts · {series.labels[hovered]}</div>}
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full overflow-visible sm:h-[220px]" role="img" aria-label={`Usage analytics for ${range}`}>
          <defs><linearGradient id="analytics-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity=".22" /><stop offset="100%" stopColor="#22D3EE" stopOpacity="0" /></linearGradient><linearGradient id="analytics-stroke"><stop stopColor="#8B5CF6" /><stop offset="100%" stopColor="#22D3EE" /></linearGradient></defs>
          {[0, 1, 2, 3].map((lineIndex) => { const y = 18 + lineIndex * 62; return <line key={lineIndex} x1="14" x2={width - 14} y1={y} y2={y} stroke="rgba(255,255,255,.065)" strokeDasharray="3 7" /> })}
          <motion.path key={`${range}-area`} d={area} fill="url(#analytics-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} />
          <motion.path key={`${range}-line`} d={line} fill="none" stroke="url(#analytics-stroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0.01 : 0.72, ease: [0.22, 1, 0.36, 1] }} />
          {points.map(({ x, y }, index) => <g key={index} className="chart-point" role="button" tabIndex="0" aria-pressed={hovered === index} aria-label={`${series.labels[index]} activity`} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onClick={() => setHovered(hovered === index ? null : index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setHovered(hovered === index ? null : index) } }}><circle cx={x} cy={y} r="12" fill="transparent" /><circle cx={x} cy={y} r={hovered === index ? 5 : 3} fill="#0a0c18" stroke="#22D3EE" strokeWidth="1.5" /></g>)}
          {points.map(({ x }, index) => <text key={`tick-${index}`} x={x} y={height - 1} fill="#68708a" fontSize="9" textAnchor="middle">{series.labels[index]}</text>)}
        </svg>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-600"><MousePointer2 size={11} />Hover chart points to inspect activity</div>
    </GlassCard>
  )
}
