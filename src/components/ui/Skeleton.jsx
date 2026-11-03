export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <span aria-hidden="true" className={`block ${rounded} bg-gradient-to-r from-white/[0.035] via-white/[0.09] to-white/[0.035] bg-[length:200%_100%] motion-safe:animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] motion-reduce:animate-none ${className}`} />
}
