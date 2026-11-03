import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import AIOrb from './AIOrb.jsx'
import PromptInput from './PromptInput.jsx'
import PromptResponse from './PromptResponse.jsx'
import DashboardOverview from './DashboardOverview.jsx'

const mockResponse = (prompt) => {
  const cleanedPrompt = prompt.replace(/[.!?]+$/, '')
  return `Here’s a useful starting point for “${cleanedPrompt}”. Break the goal into a few clear steps, identify the key information you need, and tackle the highest-impact part first. You can refine the direction with a follow-up prompt.`
}

export default function DashboardHero({ onNavigate }) {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState('idle')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [response, setResponse] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const submitPrompt = (prompt) => {
    window.clearTimeout(timeoutRef.current)
    setCurrentPrompt(prompt)
    setResponse('')
    setState('thinking')
    timeoutRef.current = window.setTimeout(() => {
      setResponse(mockResponse(prompt))
      setState('responding')
    }, 1400)
  }

  return (
    <>
    <section className="mx-auto flex min-h-[calc(100dvh-145px)] w-full max-w-4xl flex-col items-center justify-center py-6 text-center sm:py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-2 flex items-center gap-2 rounded-full border border-nexus-cyan/15 bg-nexus-cyan/[0.045] px-3 py-1.5 text-[10px] uppercase tracking-[0.17em] text-nexus-cyan/80">
        <motion.span animate={reduceMotion ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }} transition={reduceMotion ? { duration: 0.01 } : { duration: 2.4, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {state === 'thinking' ? 'Processing your prompt' : state === 'responding' ? 'Intelligence online' : 'Your AI workspace'}
      </motion.div>
      <div className="relative z-0 -my-1 sm:my-0"><AIOrb state={state} /></div>
      <motion.div layout className="relative z-10 -mt-1 w-full">
        <h2 className="text-[clamp(1.75rem,7vw,2.625rem)] font-semibold tracking-tight text-white lg:text-[42px]">Your Intelligence, Amplified.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-nexus-muted sm:text-[15px]">
          NEXUS brings your ideas, knowledge, and AI tools together in one intelligent workspace.
        </p>
        <div className="mx-auto mt-7 w-full max-w-2xl text-left">
          <PromptInput onSubmit={submitPrompt} disabled={state === 'thinking'} />
        </div>
        <PromptResponse prompt={currentPrompt} response={response} state={state} />
      </motion.div>
    </section>
    <DashboardOverview onNavigate={onNavigate} />
    </>
  )
}
