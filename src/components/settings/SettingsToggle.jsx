export default function SettingsToggle({ title, description, checked, onChange }) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg py-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-nexus-cyan/70">
      <span><span className="block text-[11px] font-medium text-slate-300">{title}</span><span className="mt-1 block text-[9px] leading-4 text-slate-600">{description}</span></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={`relative h-[22px] w-10 shrink-0 rounded-full border transition-colors ${checked ? 'border-nexus-cyan/30 bg-nexus-cyan/20' : 'border-white/10 bg-white/[0.05]'}`}>
        <span className={`absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full transition-transform ${checked ? 'translate-x-[18px] bg-nexus-cyan shadow-[0_0_10px_rgba(34,211,238,.5)]' : 'bg-slate-500'}`} />
      </span>
    </label>
  )
}
