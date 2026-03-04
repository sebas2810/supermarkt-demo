const LAYER_COLORS = {
  ML: { color: '#0058AB', label: 'ML' },
  SLM: { color: '#1DB8F2', label: 'SLM' },
  LLM: { color: '#00D5D0', label: 'LLM' },
  Agent: { color: '#FF816E', label: 'Agent' },
  Twin: { color: '#00828E', label: 'Twin' },
}

const ALL_LAYERS = ['ML', 'SLM', 'LLM', 'Agent', 'Twin']

export default function LayerIndicator({ layers = [], showLabels = false }) {
  return (
    <div className="flex items-center gap-1">
      {ALL_LAYERS.map(layer => {
        const active = layers.includes(layer)
        const config = LAYER_COLORS[layer]
        return (
          <div key={layer} className="flex items-center gap-0.5" title={config.label}>
            <div
              className={`w-2 h-2 rounded-full transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}
              style={{ backgroundColor: config.color }}
            />
            {showLabels && (
              <span className={`text-[8px] font-mono ${active ? 'text-gray-300' : 'text-gray-600'}`}>
                {config.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
