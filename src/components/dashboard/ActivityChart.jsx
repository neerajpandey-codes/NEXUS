import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { activitySeries } from '../../data/dashboardData.js'

const chartWidth = 720
const chartHeight = 220
const insetX = 12
const insetY = 18

function getCoordinates(values) {
  return values.map((value, index) => ({
    x: insetX + (index / (values.length - 1)) * (chartWidth - insetX * 2),
    y: chartHeight - insetY - (value / 100) * (chartHeight - insetY * 2),
  }))
}

function makeLine(points) {
  return points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

export default function ActivityChart() {
  const reduceMotion = useReducedMotion()
  const [period, setPeriod] = useState('week')
  const [activePoint, setActivePoint] = useState(null)
  const series = activitySeries[period]
  const coordinates = getCoordinates(series.points)
  const line = makeLine(coordinates)
  const area = `${line} L ${chartWidth - insetX} ${chartHeight} L ${insetX} ${chartHeight} Z`

  return (
    <GlassCard className="relative overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-nexus-cyan/10 text-nexus-cyan"><BarChart3 size={17} /></span>
          <div>
            <h3 className="text-sm font-medium text-slate-100">Activity overview</h3>
            <p className="mt-1 text-[11px] text-slate-500">Prompt volume across your workspace</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-white/[0.06] bg-black/10 p-0.5" role="group" aria-label="Chart time range">
          {['week', 'month'].map((key) => (
            <button key={key} type="button" aria-pressed={period === key} onClick={() => { setPeriod(key); setActivePoint(null) }} className={`relative min-h-10 rounded-md px-3 py-2 text-[10px] capitalize transition-colors ${period === key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {period === key && <motion.span layoutId="chart-period" className="absolute inset-0 rounded-md bg-white/[0.08]" />}
              <span className="relative">{key}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">{series.total}</span>
        <span className="mb-1 flex items-center text-[10px] font-medium text-emerald-400"><ArrowUpRight size={13} />{series.delta}</span>
        <span className="mb-1 ml-1 text-[10px] text-slate-600">prompts · {series.label.toLowerCase()}</span>
      </div>

      <div className="relative" onMouseLeave={() => setActivePoint(null)}>
        {activePoint !== null && (
          <div className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-[#111426]/95 px-2.5 py-1.5 text-[10px] shadow-xl" style={{ left: `${Math.min(90, Math.max(10, (coordinates[activePoint].x / chartWidth) * 100))}%`, top: `${(coordinates[activePoint].y / chartHeight) * 100}%` }}>
            <span className="font-medium text-white">{series.points[activePoint] * 14}</span><span className="ml-1.5 text-slate-500">{series.labels[activePoint]}</span>
          </div>
        )}
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[175px] w-full overflow-visible sm:h-[210px]" role="img" aria-label={`${series.label} activity chart`}>
          <defs>
            <linearGradient id="activity-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity=".2" /><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" /></linearGradient>
            <linearGradient id="activity-line" x1="0" x2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#22D3EE" /></linearGradient>
          </defs>
          {[0, 1, 2, 3].map((lineIndex) => {
            const y = insetY + (lineIndex / 3) * (chartHeight - insetY * 2)
            return <line key={lineIndex} x1={insetX} x2={chartWidth - insetX} y1={y} y2={y} stroke="rgba(255,255,255,.07)" strokeDasharray="3 7" />
          })}
          <motion.path key={`${period}-area`} d={area} fill="url(#activity-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
          <motion.path key={`${period}-line`} d={line} fill="none" stroke="url(#activity-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0.01 : 0.72, ease: [0.22, 1, 0.36, 1] }} />
          {coordinates.map(({ x, y }, index) => (
            <g key={`${period}-${index}`} className="chart-point" onMouseEnter={() => setActivePoint(index)} onFocus={() => setActivePoint(index)} onClick={() => setActivePoint(activePoint === index ? null : index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActivePoint(activePoint === index ? null : index) } }} tabIndex="0" role="button" aria-pressed={activePoint === index} aria-label={`${series.labels[index]}: ${series.points[index] * 14} prompts`}>
              <circle cx={x} cy={y} r="13" fill="transparent" />
              <circle cx={x} cy={y} r={activePoint === index ? 5 : 3.5} fill="#08101d" stroke="#22D3EE" strokeWidth={activePoint === index ? 2.5 : 1.5} className="transition-all" />
            </g>
          ))}
          {coordinates.map(({ x }, index) => <text key={`label-${index}`} x={x} y={chartHeight - 2} textAnchor="middle" fill="#68708a" fontSize="9">{series.labels[index]}</text>)}
        </svg>
      </div>
    </GlassCard>
  )
}
