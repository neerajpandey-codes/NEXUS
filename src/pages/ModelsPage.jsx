import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Cpu, Search, ShieldCheck, Sparkles } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import { aiModels } from '../data/phase7Data.js'

const filters = ['All models', 'General', 'Reasoning', 'Creative', 'Code']
const iconTones = { cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-300/15', purple: 'bg-purple-400/10 text-purple-300 border-purple-300/15', blue: 'bg-indigo-400/10 text-indigo-300 border-indigo-300/15', green: 'bg-emerald-400/10 text-emerald-300 border-emerald-300/15', pink: 'bg-pink-400/10 text-pink-300 border-pink-300/15', amber: 'bg-amber-400/10 text-amber-300 border-amber-300/15' }

function ModelCard({ model, selected, onSelect, index }) {
  const Icon = model.icon
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
      <GlassCard className={`relative flex h-full flex-col overflow-hidden p-5 transition-colors ${selected ? 'border-nexus-cyan/25 shadow-[0_12px_48px_rgba(34,211,238,.08)]' : 'hover:border-white/[0.14]'}`}>
        {selected && <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-nexus-cyan/[0.08] blur-3xl" />}
        <div className="relative flex items-start justify-between gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl border ${iconTones[model.color]}`}><Icon size={19} strokeWidth={1.7} /></span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.045] px-2 py-1 text-[9px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Available</span>
        </div>
        <div className="relative mt-4"><div className="text-[9px] uppercase tracking-[0.14em] text-slate-600">{model.provider}</div><h2 className="mt-1 text-base font-medium text-white">{model.name}</h2><p className="mt-2 min-h-[60px] text-[11px] leading-5 text-slate-400">{model.description}</p></div>
        <div className="mt-4 flex flex-wrap gap-1.5">{model.capabilities.map((capability) => <span key={capability} className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] text-slate-500">{capability}</span>)}</div>
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[9px] text-slate-500"><span>{model.context}</span><span>{model.latency} avg.</span></div>
        <button type="button" onClick={() => onSelect(model.id)} aria-pressed={selected} className={`mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg border text-[11px] font-medium transition ${selected ? 'border-nexus-cyan/25 bg-nexus-cyan/[0.08] text-nexus-cyan' : 'border-white/[0.08] bg-white/[0.025] text-slate-300 hover:border-nexus-purple/30 hover:text-white'}`}>
          {selected ? <><Check size={14} />Selected model</> : 'Select model'}
        </button>
      </GlassCard>
    </motion.div>
  )
}

export default function ModelsPage() {
  const [filter, setFilter] = useState('All models')
  const [query, setQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const savedModel = window.localStorage.getItem('nexus-selected-model')
      return aiModels.some((model) => model.id === savedModel) ? savedModel : 'gpt-4o'
    } catch {
      return 'gpt-4o'
    }
  })
  const selectModel = (id) => {
    setSelectedModel(id)
    try { window.localStorage.setItem('nexus-selected-model', id) } catch { /* Keep selection usable without storage. */ }
  }
  const models = useMemo(() => aiModels.filter((model) => (filter === 'All models' || model.category === filter) && `${model.name} ${model.provider}`.toLowerCase().includes(query.toLowerCase())), [filter, query])
  const selected = aiModels.find((model) => model.id === selectedModel)

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nexus-cyan/70">Intelligence library</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">AI Models</h2><p className="mt-2 max-w-lg text-xs leading-5 text-nexus-muted">Choose the right model for every kind of work. All status and performance details are illustrative.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[10px] text-slate-500"><Cpu size={14} className="text-nexus-cyan" />{aiModels.length} models connected</div></div>
      <GlassCard className="mb-5 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-0.5" role="group" aria-label="Filter models">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`min-h-11 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] transition ${filter === item ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-200'}`}>{item}</button>)}</div>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-black/10 px-3 text-slate-600 sm:w-52"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search AI models" placeholder="Find a model..." className="w-full bg-transparent text-[10px] text-slate-200 outline-none placeholder:text-slate-600" /></label>
      </GlassCard>
      <div className="mb-4 flex items-center gap-2 text-[10px] text-slate-500"><ShieldCheck size={13} className="text-emerald-400" />Current default: <span className="font-medium text-slate-300">{selected?.name}</span><Sparkles size={12} className="ml-auto text-nexus-purple" />Mock model catalog</div>
      {models.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{models.map((model, index) => <ModelCard key={model.id} model={model} selected={model.id === selectedModel} onSelect={selectModel} index={index} />)}</div> : <GlassCard className="p-10 text-center text-xs text-slate-500">No models match your search.</GlassCard>}
    </div>
  )
}
