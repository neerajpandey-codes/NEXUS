import { motion } from 'framer-motion'
import { dashboardStats } from '../../data/dashboardData.js'
import StatCard from './StatCard.jsx'
import ActivityChart from './ActivityChart.jsx'
import RecentPrompts from './RecentPrompts.jsx'
import ModelStatusCard from './ModelStatusCard.jsx'
import { fadeUp, staggerChildren } from '../../lib/motion.js'

export default function DashboardOverview({ onNavigate }) {
  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-4 flex items-end justify-between gap-3 px-0.5">
        <div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nexus-cyan/70">Workspace insights</p><h2 className="mt-1.5 text-base font-medium text-white sm:text-lg">Your activity at a glance</h2></div>
        <span className="hidden text-[10px] text-slate-600 sm:block">Updated just now</span>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => <StatCard key={stat.label} stat={stat} index={index} />)}
      </div>
      <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <motion.div variants={fadeUp}><ActivityChart /></motion.div>
        <motion.div variants={fadeUp}><RecentPrompts onNavigate={onNavigate} /></motion.div>
      </motion.div>
      <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="mt-4">
        <motion.div variants={fadeUp}><ModelStatusCard onNavigate={onNavigate} /></motion.div>
      </motion.div>
    </div>
  )
}
