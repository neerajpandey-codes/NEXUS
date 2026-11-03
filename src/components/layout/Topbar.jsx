import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Command, Search } from 'lucide-react'
import BackendStatusIndicator from '../ui/BackendStatusIndicator.jsx'

const pages = ['Dashboard', 'AI Chat', 'Models', 'Analytics', 'Settings']

export default function Topbar({ activePage, onToggleSidebar, onNavigate, mobileMenuOpen, backendHealth }) {
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(null)
  const searchRef = useRef(null)
  const matches = pages.filter((page) => page.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && searchRef.current?.offsetParent) {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') setMenu(null)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const goToPage = (page) => {
    onNavigate(page)
    setQuery('')
    searchRef.current?.blur()
  }

  return (
    <header className="relative z-10 flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] bg-[#080a17]/45 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onToggleSidebar} aria-expanded={mobileMenuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-nexus-muted transition hover:bg-white/[0.05] hover:text-white md:hidden" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}><Command size={17} /></button>
        <div className="min-w-0"><div className="hidden items-center gap-2 text-[11px] text-slate-600 sm:flex"><span>NEXUS</span><span>/</span><span className="text-slate-400">Workspace</span></div><h1 className="truncate text-sm font-medium text-nexus-text sm:mt-1">{activePage}</h1></div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden h-9 w-56 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-nexus-muted transition focus-within:border-nexus-purple/40 lg:flex">
          <Search size={15} />
          <input ref={searchRef} aria-label="Search pages" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) goToPage(matches[0]) }} placeholder="Search pages..." className="w-full bg-transparent text-xs text-nexus-text outline-none placeholder:text-slate-600" />
          <kbd className="shrink-0 rounded border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-slate-600">Ctrl K</kbd>
          {query.trim() && <div role="listbox" aria-label="Matching pages" className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-white/10 bg-[#101321] p-1 shadow-2xl">{matches.length ? matches.map((page) => <button key={page} type="button" role="option" aria-selected={page === activePage} onClick={() => goToPage(page)} className="block min-h-10 w-full rounded-lg px-3 text-left text-xs text-slate-300 hover:bg-white/[0.06]">{page}</button>) : <p className="px-3 py-2 text-xs text-slate-500">No matching pages.</p>}</div>}
        </label>

        <BackendStatusIndicator {...backendHealth} labelClassName="inline max-w-[4.25rem] truncate sm:max-w-none" />

        <div className="relative">
          <button type="button" aria-label="Notifications" aria-expanded={menu === 'notifications'} onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')} className="relative grid h-11 w-11 place-items-center rounded-lg border border-white/[0.07] text-nexus-muted transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"><Bell size={17} /><span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full border border-[#080a17] bg-nexus-cyan" /></button>
          {menu === 'notifications' && <div role="status" className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-white/10 bg-[#101321] p-4 shadow-2xl"><p className="text-xs font-medium text-slate-200">Notifications</p><p className="mt-2 text-[11px] leading-5 text-slate-500">You’re all caught up. Notifications are demo-only in this workspace.</p></div>}
        </div>

        <div className="mx-0.5 hidden h-7 w-px bg-white/[0.08] sm:block" />
        <div className="relative">
          <button type="button" onClick={() => setMenu(menu === 'profile' ? null : 'profile')} aria-expanded={menu === 'profile'} className="flex min-h-11 items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition hover:bg-white/[0.04]" aria-label="User profile menu">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-nexus-purple/50 to-nexus-cyan/30 text-[10px] font-semibold text-white ring-1 ring-white/10">AM</span>
            <span className="hidden text-left sm:block"><span className="block text-xs font-medium text-slate-200">Alex Morgan</span><span className="mt-0.5 block text-[10px] text-slate-500">Pro workspace</span></span><ChevronDown size={14} className="hidden text-slate-500 sm:block" />
          </button>
          {menu === 'profile' && <div role="menu" aria-label="Profile menu" className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-white/10 bg-[#101321] p-2 shadow-2xl"><p className="px-3 py-2 text-[11px] text-slate-500">Signed in locally as Alex Morgan</p><button type="button" role="menuitem" onClick={() => { setMenu(null); goToPage('Settings') }} className="min-h-10 w-full rounded-lg px-3 text-left text-xs text-slate-200 hover:bg-white/[0.06]">Open settings</button></div>}
        </div>
      </div>
    </header>
  )
}
