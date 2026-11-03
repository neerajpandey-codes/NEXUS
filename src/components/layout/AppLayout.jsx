import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleBackground from '../effects/ParticleBackground.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import MobileNav from './MobileNav.jsx'
import { pageTransition } from '../../lib/motion.js'
import useSettingsPreferences from '../../hooks/useSettingsPreferences.js'
import useBackendHealth from '../../hooks/useBackendHealth.js'

export default function AppLayout({ activePage, onNavigate, children }) {
  const [preferences] = useSettingsPreferences()
  const backendHealth = useBackendHealth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = (page) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMobileMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  return (
    <div data-appearance={preferences.appearance} data-compact={preferences.general.compact} className="nexus-app relative flex h-dvh min-h-[480px] overflow-hidden bg-nexus-background text-nexus-text">
      <ParticleBackground count={48} />
      <Sidebar activePage={activePage} onNavigate={navigate} backendHealth={backendHealth} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar activePage={activePage} onNavigate={navigate} backendHealth={backendHealth} mobileMenuOpen={mobileMenuOpen} onToggleSidebar={() => setMobileMenuOpen((value) => !value)} />
        <main className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-28 sm:pt-7 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={pageTransition} className="mx-auto w-full max-w-[1400px]">
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav activePage={activePage} onNavigate={navigate} />
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/60 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} />
            <motion.aside role="dialog" aria-modal="true" aria-label="Mobile navigation" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="fixed inset-y-0 left-0 z-50 flex w-[min(264px,calc(100vw-2rem))] flex-col border-r border-white/10 bg-[#080a17] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl md:hidden">
              <div className="mb-10 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-nexus-cyan/20 bg-nexus-cyan/[0.08] text-nexus-cyan"><span className="text-lg">✳</span></div><div><div className="text-sm font-semibold tracking-[0.2em]">NEXUS</div><div className="text-[9px] uppercase tracking-[0.18em] text-nexus-muted">Command Center</div></div></div>
              <nav aria-label="Mobile menu" className="space-y-1">{['Dashboard', 'AI Chat', 'Models', 'Analytics', 'Settings'].map((label) => <button key={label} onClick={() => navigate(label)} className={`block w-full rounded-lg px-3 py-3 text-left text-sm ${activePage === label ? 'bg-nexus-purple/15 text-white' : 'text-nexus-muted hover:bg-white/5'}`}>{label}</button>)}</nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
