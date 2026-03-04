import { useState, useEffect } from 'react'

const STATUS_STYLES = {
  live: { bg: 'bg-risk-green/10', border: 'border-risk-green/30', badge: 'bg-risk-green', text: 'text-risk-green', glow: 'glow-green' },
  deploying: { bg: 'bg-cap-orange/10', border: 'border-cap-orange/30', badge: 'bg-cap-orange', text: 'text-cap-orange', glow: 'glow-amber' },
  planned: { bg: 'bg-navy-light', border: 'border-navy-mid', badge: 'bg-gray-600', text: 'text-gray-400', glow: '' },
  template: { bg: 'bg-navy-light', border: 'border-cap-blue/20', badge: 'bg-cap-blue', text: 'text-cap-blue', glow: '' },
}

export default function BrandCard({ brand, index }) {
  const [visible, setVisible] = useState(false)
  const style = STATUS_STYLES[brand.status]
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200 + index * 150)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-3 transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } ${style.glow}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${style.badge} ${brand.status === 'live' ? 'animate-pulse' : ''}`} />
          <h3 className="text-sm font-bold text-white">{brand.brand}</h3>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.text} ${style.bg}`}>{brand.status_label}</span>
      </div>

      <p className="text-[10px] text-gray-400 mb-1.5">{brand.country} · {brand.stores?.toLocaleString()} stores</p>
      <p className="text-xs text-gray-300 leading-relaxed mb-2">{brand.detail}</p>

      {brand.milestones && (
        <div className="space-y-1 mt-2 pt-2 border-t border-navy-mid/50">
          {brand.milestones.map(m => (
            <div key={m.name} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                m.status === 'complete' ? 'bg-risk-green/20 text-risk-green' :
                m.status === 'in_progress' ? 'bg-cap-orange/20 text-cap-orange' :
                m.status === 'scheduled' ? 'bg-cap-blue/20 text-cap-blue' :
                'bg-navy-mid text-gray-500'
              }`}>
                {m.status === 'complete' ? '\u2713' : m.status === 'in_progress' ? '\u25D0' : '\u25CB'}
              </div>
              <span className={`text-[10px] ${m.status === 'complete' ? 'text-gray-400' : 'text-gray-300'}`}>{m.name}</span>
              {m.progress && (
                <>
                  <div className="flex-1 h-1 bg-navy rounded-full overflow-hidden ml-1">
                    <div className="h-full bg-cap-orange rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-cap-orange font-mono">{m.progress}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {brand.status === 'live' && (
        <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-risk-green/20">
          <div className="text-center">
            <span className="text-sm font-bold text-risk-green">{brand.waste_reduction_pct}%</span>
            <p className="text-[8px] text-gray-400">Waste reduction</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-white">{brand.interventions_90d}</span>
            <p className="text-[8px] text-gray-400">Interventions</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-cap-cyan">W{brand.week}</span>
            <p className="text-[8px] text-gray-400">Week</p>
          </div>
        </div>
      )}
    </div>
  )
}
