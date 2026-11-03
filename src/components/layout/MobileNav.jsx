import { motion } from 'framer-motion'
import { navigationItems } from './navigation.js'

export default function MobileNav({ activePage, onNavigate }) {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[0.09] bg-[#090b18]/90 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl md:hidden">
      {navigationItems.map(({ label, icon: Icon }) => {
        const active = activePage === label
        return (
          <button key={label} type="button" onClick={() => onNavigate(label)} aria-current={active ? 'page' : undefined} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] transition-colors ${active ? 'text-nexus-cyan' : 'text-slate-500'}`}>
            {active && <motion.span layoutId="mobile-active-nav" className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-nexus-cyan shadow-[0_0_12px_#22D3EE]" />}
            <Icon size={18} strokeWidth={active ? 2 : 1.7} />
            <span>{label === 'Dashboard' ? 'Home' : label === 'Analytics' ? 'Stats' : label}</span>
          </button>
        )
      })}
    </nav>
  )
}
