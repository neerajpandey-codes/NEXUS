import { useMemo } from 'react'

const COLORS = ['#22D3EE', '#8B5CF6', '#6366F1']

function createParticles(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    color: COLORS[index % COLORS.length],
    opacity: (Math.random() * 0.38 + 0.12).toFixed(2),
    duration: `${Math.random() * 8 + 7}s`,
    delay: `${Math.random() * -12}s`,
    drift: `${Math.random() * 34 - 17}px`,
  }))
}

export default function ParticleBackground({ count = 56 }) {
  const particles = useMemo(() => createParticles(count), [count])

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle"
          style={{
            '--x': particle.x,
            '--y': particle.y,
            '--size': particle.size,
            '--color': particle.color,
            '--opacity': particle.opacity,
            '--duration': particle.duration,
            '--delay': particle.delay,
            '--drift': particle.drift,
          }}
        />
      ))}
    </div>
  )
}
