export const pageTransition = {
  duration: 0.26,
  ease: [0.22, 1, 0.36, 1],
}

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
}

export const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.04 } },
}
