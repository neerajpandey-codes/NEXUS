const statusDetails = {
  loading: { label: 'Checking backend', visibleLabel: 'Checking', color: 'bg-amber-400' },
  connected: { label: 'Backend connected', visibleLabel: 'Connected', color: 'bg-emerald-400' },
  disconnected: { label: 'Backend disconnected', visibleLabel: 'Disconnected', color: 'bg-rose-400' },
}

export default function BackendStatusIndicator({ status, error, labelClassName = 'inline', announce = true }) {
  const details = statusDetails[status] ?? statusDetails.loading

  return (
    <div
      role={announce ? 'status' : undefined}
      aria-label={details.label}
      aria-live={announce ? 'polite' : 'off'}
      title={error ? `${details.label}: ${error}` : details.label}
      className="flex min-w-0 items-center gap-2 text-[10px] text-nexus-muted"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${details.color} ${status === 'loading' ? 'animate-pulse' : ''}`} aria-hidden="true" />
      <span className={labelClassName}>{details.visibleLabel}</span>
    </div>
  )
}
