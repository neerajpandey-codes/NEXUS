import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, MonitorCog, Palette, RotateCcw, Settings2, UserRound } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard.jsx'
import SettingsSection from '../components/settings/SettingsSection.jsx'
import SettingsToggle from '../components/settings/SettingsToggle.jsx'
import useSettingsPreferences from '../hooks/useSettingsPreferences.js'
import { settingsDefaults } from '../data/phase7Data.js'

const appearanceOptions = [
  { id: 'midnight', label: 'Midnight', description: 'Deep navy and violet', swatches: ['#05060F', '#8B5CF6', '#22D3EE'] },
  { id: 'aurora', label: 'Aurora', description: 'Cool blue and cyan', swatches: ['#07121C', '#22D3EE', '#818CF8'] },
  { id: 'dusk', label: 'Dusk', description: 'Soft indigo and rose', swatches: ['#100B1D', '#A78BFA', '#F472B6'] },
]

export default function SettingsPage() {
  const [preferences, setPreferences] = useSettingsPreferences()
  const [saved, setSaved] = useState(false)

  const updateProfile = (field, value) => setPreferences((current) => ({ ...current, profile: { ...current.profile, [field]: value } }))
  const updateNotification = (field, value) => setPreferences((current) => ({ ...current, notifications: { ...current.notifications, [field]: value } }))
  const updateGeneral = (field, value) => setPreferences((current) => ({ ...current, general: { ...current.general, [field]: value } }))

  const saveProfile = (event) => {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const resetSettings = () => {
    setPreferences(structuredClone(settingsDefaults))
    setSaved(false)
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nexus-cyan/70">Workspace preferences</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Settings</h2><p className="mt-2 text-xs text-nexus-muted">Make your NEXUS workspace feel like yours.</p></div><button type="button" onClick={resetSettings} className="flex items-center gap-2 self-start rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-500 transition hover:border-white/15 hover:text-slate-200 sm:self-auto"><RotateCcw size={12} />Reset preferences</button></div>

      <div className="space-y-6">
        <SettingsSection icon={UserRound} title="Profile" description="Your personal workspace details" delay={0}>
          <form onSubmit={saveProfile} className="py-4">
            <div className="mb-4 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-nexus-purple/50 to-nexus-cyan/30 text-xs font-semibold text-white ring-1 ring-white/10">{preferences.profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><div className="text-[11px] font-medium text-slate-200">Account profile</div><div className="mt-1 text-[9px] text-slate-600">Visible to you in this browser</div></div></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-[9px] text-slate-500">Display name<input value={preferences.profile.name} onChange={(event) => updateProfile('name', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.07] bg-black/10 px-3 text-[11px] text-slate-200 outline-none transition focus:border-nexus-purple/35" /></label><label className="text-[9px] text-slate-500">Email address<input type="email" value={preferences.profile.email} onChange={(event) => updateProfile('email', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.07] bg-black/10 px-3 text-[11px] text-slate-200 outline-none transition focus:border-nexus-purple/35" /></label></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[9px] text-slate-600">Preferences stay in local browser storage.</p><button type="submit" className="flex min-h-11 items-center gap-1.5 rounded-lg border border-nexus-cyan/20 bg-nexus-cyan/[0.07] px-3 text-[10px] text-nexus-cyan transition hover:bg-nexus-cyan/[0.12]"><Check size={12} />Save profile</button></div>
            <AnimatePresence>{saved && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-right text-[9px] text-emerald-400">Profile saved on this device.</motion.p>}</AnimatePresence>
          </form>
        </SettingsSection>

        <SettingsSection icon={Palette} title="Appearance" description="Choose the atmosphere for your workspace" delay={0.06}>
          <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-3">{appearanceOptions.map((option) => { const selected = preferences.appearance === option.id; return <button key={option.id} type="button" aria-pressed={selected} onClick={() => setPreferences((current) => ({ ...current, appearance: option.id }))} className={`rounded-xl border p-3 text-left transition ${selected ? 'border-nexus-cyan/25 bg-nexus-cyan/[0.045]' : 'border-white/[0.06] bg-black/[0.08] hover:border-white/[0.13]'}`}><div className="mb-3 flex h-14 gap-1 overflow-hidden rounded-lg border border-white/[0.05] p-1" style={{ background: option.swatches[0] }}><span className="w-1/4 rounded bg-white/[0.06]" /><span className="flex-1 rounded p-2"><span className="block h-2 w-2/3 rounded" style={{ background: option.swatches[1] }} /><span className="mt-2 block h-4 rounded border border-white/[0.07] bg-white/[0.04]" /></span><span className="w-1/5 rounded" style={{ background: `${option.swatches[2]}25` }} /></div><span className="flex items-center justify-between"><span><span className="block text-[10px] font-medium text-slate-200">{option.label}</span><span className="mt-1 block text-[9px] text-slate-600">{option.description}</span></span>{selected && <Check size={13} className="text-nexus-cyan" />}</span></button> })}</div>
        </SettingsSection>

        <SettingsSection icon={Bell} title="Notifications" description="Choose what NEXUS keeps you up to date on" delay={0.12}>
          <SettingsToggle title="Product updates" description="New features and improvements to your workspace." checked={preferences.notifications.product} onChange={(value) => updateNotification('product', value)} />
          <SettingsToggle title="Activity summaries" description="A weekly snapshot of your workspace usage." checked={preferences.notifications.activity} onChange={(value) => updateNotification('activity', value)} />
          <SettingsToggle title="Tips and recommendations" description="Ideas for getting more from your AI tools." checked={preferences.notifications.tips} onChange={(value) => updateNotification('tips', value)} />
        </SettingsSection>

        <SettingsSection icon={Settings2} title="General" description="Fine tune how the workspace behaves" delay={0.18}>
          <SettingsToggle title="Compact interface" description="Use a tighter layout for lists and panels." checked={preferences.general.compact} onChange={(value) => updateGeneral('compact', value)} />
          <SettingsToggle title="Enter to send messages" description="Press Enter to send, or Shift + Enter for a new line." checked={preferences.general.enterToSend} onChange={(value) => updateGeneral('enterToSend', value)} />
          <label className="flex flex-wrap items-center justify-between gap-3 py-4"><span><span className="block text-[11px] font-medium text-slate-300">Language</span><span className="mt-1 block text-[9px] text-slate-600">Language used for your interface.</span></span><select value={preferences.general.language} onChange={(event) => updateGeneral('language', event.target.value)} className="h-11 max-w-full rounded-lg border border-white/[0.08] bg-[#111321] px-3 text-[10px] text-slate-300 outline-none focus:border-nexus-purple/35"><option>English (US)</option><option>English (UK)</option><option>Hindi</option><option>日本語</option></select></label>
        </SettingsSection>

        <div className="flex items-center gap-2 px-1 text-[9px] text-slate-600"><MonitorCog size={12} />Settings are saved locally in this browser. No account service is connected.</div>
      </div>
    </div>
  )
}
