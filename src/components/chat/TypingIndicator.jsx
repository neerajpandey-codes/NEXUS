import { motion, useReducedMotion } from 'framer-motion'
import { Command } from 'lucide-react'

export default function TypingIndicator() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3" aria-label="NEXUS is typing" role="status">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-nexus-cyan/15 bg-nexus-cyan/[0.08] text-nexus-cyan"><Command size={15} /></span>
      <div><p className="mb-1.5 text-[10px] text-nexus-cyan/80">NEXUS is thinking</p><div className="flex h-10 items-center gap-1 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.045] px-4">
        {[0, 1, 2].map((dot) => <motion.span key={dot} className="h-1.5 w-1.5 rounded-full bg-nexus-cyan" animate={reduceMotion ? { opacity: 0.8 } : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }} transition={reduceMotion ? { duration: 0.01 } : { duration: 0.8, repeat: Infinity, delay: dot * 0.14 }} />)}
      </div></div>
    </motion.div>
  )
}
