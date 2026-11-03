/** A reusable translucent surface for NEXUS panels and cards. */
export default function GlassCard({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-glass backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
