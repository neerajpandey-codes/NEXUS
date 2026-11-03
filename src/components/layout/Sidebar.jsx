import { motion } from 'framer-motion'
import { ChevronLeft, Command, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { navigationItems } from './navigation.js'
import BackendStatusIndicator from '../ui/BackendStatusIndicator.jsx'

export default function Sidebar({ activePage, onNavigate, backendHealth, collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 264 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="relative z-20 hidden shrink-0 flex-col border-r border-white/[0.07] bg-[#080a17]/80 px-4 py-6 backdrop-blur-2xl md:flex"
    >
      <div className={`mb-10 flex h-11 items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'}`}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-nexus-cyan/20 bg-nexus-cyan/[0.08] text-nexus-cyan shadow-[0_0_24px_rgba(34,211,238,0.1)]">
          <Command size={20} strokeWidth={1.8} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden whitespace-nowrap">
            <div className="text-[15px] font-semibold tracking-[0.2em] text-nexus-text">NEXUS</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.19em] text-nexus-muted">Command Center</div>
          </motion.div>
        )}
      </div>

      {!collapsed && <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">Workspace</p>}
      <nav aria-label="Main navigation" className="space-y-1.5">
        {navigationItems.map(({ label, icon: Icon }) => {
          const active = activePage === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(label)}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={`group relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-left text-[13px] transition-colors ${
                active
                  ? 'text-nexus-text'
                  : 'text-nexus-muted hover:bg-white/[0.04] hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              {active && (
                <motion.span
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 rounded-xl border border-nexus-purple/20 bg-gradient-to-r from-nexus-purple/[0.15] to-nexus-cyan/[0.05]"
                  transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                />
              )}
              {active && <motion.span layoutId="active-nav-rail" className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r bg-nexus-cyan shadow-[0_0_10px_#22D3EE]" />}
              <Icon size={18} strokeWidth={active ? 2 : 1.7} className={`relative z-10 shrink-0 ${active ? 'text-nexus-cyan' : 'group-hover:text-slate-200'}`} />
              {!collapsed && <span className="relative z-10 whitespace-nowrap">{label}</span>}
              {active && !collapsed && <ChevronLeft size={14} className="relative z-10 ml-auto rotate-180 text-nexus-cyan/70" />}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className={`mb-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 ${collapsed ? 'flex justify-center p-2' : ''}`}>
          <BackendStatusIndicator {...backendHealth} announce={false} labelClassName={collapsed ? 'hidden' : 'inline'} />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={17} /><span>Collapse sidebar</span></>}
        </button>
      </div>
    </motion.aside>
  )
}
