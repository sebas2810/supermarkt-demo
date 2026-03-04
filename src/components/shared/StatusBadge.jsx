const STATUS_CONFIG = {
  healthy: { label: 'Healthy', bg: 'bg-risk-green/10', border: 'border-risk-green/30', text: 'text-risk-green', dot: 'bg-risk-green' },
  degraded: { label: 'Degraded', bg: 'bg-risk-amber/10', border: 'border-risk-amber/30', text: 'text-risk-amber', dot: 'bg-risk-amber' },
  alert: { label: 'Alert', bg: 'bg-risk-red/10', border: 'border-risk-red/30', text: 'text-risk-red', dot: 'bg-risk-red' },
  Live: { label: 'Live', bg: 'bg-risk-green/10', border: 'border-risk-green/30', text: 'text-risk-green', dot: 'bg-risk-green' },
  Pilot: { label: 'Pilot', bg: 'bg-cap-cyan/10', border: 'border-cap-cyan/30', text: 'text-cap-cyan', dot: 'bg-cap-cyan' },
  Available: { label: 'Available', bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', dot: 'bg-gray-500' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Available
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg} border ${config.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className={`text-[10px] font-semibold ${config.text}`}>{config.label}</span>
    </div>
  )
}
