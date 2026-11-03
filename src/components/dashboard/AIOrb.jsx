import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const stateLabels = {
  idle: 'Ready when you are',
  thinking: 'Thinking through it',
  responding: 'Response ready',
}

export default function AIOrb({ state = 'idle' }) {
  const reduceMotion = useReducedMotion()
  const thinking = state === 'thinking'
  const responding = state === 'responding'

  return (
    <div className="relative mx-auto grid h-[230px] w-[230px] place-items-center sm:h-[280px] sm:w-[280px]" role="img" aria-label={`NEXUS AI is ${stateLabels[state].toLowerCase()}`}>
      <motion.div
        className="absolute inset-[7%] rounded-full bg-nexus-purple/25 blur-3xl"
        animate={reduceMotion ? undefined : { scale: thinking ? [0.88, 1.12, 0.88] : [0.94, 1.06, 0.94], opacity: thinking ? [0.45, 0.8, 0.45] : [0.35, 0.6, 0.35] }}
        transition={{ duration: thinking ? 1.7 : 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-[3%] rounded-full opacity-35"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,.62) 64deg, transparent 118deg, rgba(139,92,246,.5) 220deg, transparent 292deg)', maskImage: 'radial-gradient(transparent 65%, #000 68%)' }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: thinking ? 7 : 28, repeat: Infinity, ease: 'linear' }}
      />
      {!reduceMotion && responding && [0, 1].map((ring) => (
        <motion.span
          key={`response-ripple-${ring}`}
          className="absolute inset-[18%] rounded-full border border-nexus-cyan/30"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: [0.9, 1.28], opacity: [0.38, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut', delay: ring * 0.9 }}
        />
      ))}
      <motion.div
        className="absolute inset-[10%] rounded-full border border-nexus-cyan/20"
        animate={reduceMotion ? undefined : { rotate: 360, scale: responding ? [1, 1.035, 1] : 1 }}
        transition={{ rotate: { duration: thinking ? 7 : 22, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.8, repeat: responding ? Infinity : 0, ease: 'easeInOut' } }}
      >
        <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-nexus-cyan shadow-[0_0_16px_#22D3EE]" />
      </motion.div>
      <motion.div
        className="absolute inset-[15%] rounded-full border border-dashed border-nexus-purple/30"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: thinking ? 8 : 26, repeat: Infinity, ease: 'linear' }}
      >
        <span className="absolute right-[8%] top-[14%] h-1.5 w-1.5 rounded-full bg-nexus-purple shadow-[0_0_12px_#8B5CF6]" />
      </motion.div>
      <motion.div
        className="relative grid h-[62%] w-[62%] place-items-center overflow-hidden rounded-full border border-white/20 shadow-[inset_-18px_-20px_38px_rgba(5,6,15,0.78),inset_10px_8px_24px_rgba(255,255,255,0.2),0_0_48px_rgba(99,102,241,0.35)]"
        style={{ background: 'radial-gradient(circle at 34% 27%, rgba(255,255,255,.92) 0%, rgba(34,211,238,.85) 9%, rgba(99,102,241,.84) 32%, rgba(139,92,246,.72) 51%, rgba(10,15,36,.96) 78%)' }}
        animate={reduceMotion ? undefined : { scale: thinking ? [0.96, 1.035, 0.96] : [0.985, 1.015, 0.985], y: [0, -4, 0] }}
        transition={{ duration: thinking ? 1.25 : 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_70%,rgba(34,211,238,.38),transparent_46%)]" animate={reduceMotion ? undefined : { rotate: thinking ? [0, 24, 0] : [0, -10, 0] }} transition={{ duration: thinking ? 1.8 : 5, repeat: Infinity, ease: 'easeInOut' }} />
        <Sparkles className="relative z-10 text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,.8)]" size={27} strokeWidth={1.4} />
      </motion.div>
      <span className="sr-only" aria-live="polite">{stateLabels[state]}</span>
    </div>
  )
}
