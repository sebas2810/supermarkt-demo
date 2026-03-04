export default function Sparkline({ data = [], color = '#00D5D0', height = 24, width = 100 }) {
  if (!data.length) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((val - min) / range) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  // Trend indicator
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const trendUp = last > prev
  const trendFlat = last === prev

  return (
    <div className="flex items-center gap-1.5">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        {data.length > 0 && (() => {
          const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - 2 * padding)
          const lastY = height - padding - ((last - min) / range) * (height - 2 * padding)
          return <circle cx={lastX} cy={lastY} r="2" fill={color} />
        })()}
      </svg>
      <span className="text-[9px] font-mono" style={{ color }}>
        {trendFlat ? '→' : trendUp ? '↑' : '↓'}
      </span>
    </div>
  )
}
