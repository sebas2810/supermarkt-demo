import { useState, useEffect } from 'react'
import scaleData from '../data/scale_engine.json'

const STATUS_STYLES = {
  live: { bg: 'bg-risk-green/10', border: 'border-risk-green/30', badge: 'bg-risk-green', text: 'text-risk-green', glow: 'glow-green' },
  deploying: { bg: 'bg-layer-agent/10', border: 'border-layer-agent/30', badge: 'bg-layer-agent', text: 'text-layer-agent', glow: 'glow-amber' },
  planned: { bg: 'bg-navy-light', border: 'border-navy-mid', badge: 'bg-gray-600', text: 'text-gray-400', glow: '' },
  template: { bg: 'bg-navy-light', border: 'border-cap-blue/20', badge: 'bg-cap-blue', text: 'text-cap-blue', glow: '' },
}

function BrandCard({ brand, index }) {
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
                m.status === 'in_progress' ? 'bg-layer-agent/20 text-layer-agent' :
                m.status === 'scheduled' ? 'bg-cap-blue/20 text-cap-blue' :
                'bg-navy-mid text-gray-500'
              }`}>
                {m.status === 'complete' ? '✓' : m.status === 'in_progress' ? '◐' : '○'}
              </div>
              <span className={`text-[10px] ${m.status === 'complete' ? 'text-gray-400' : 'text-gray-300'}`}>{m.name}</span>
              {m.progress && (
                <>
                  <div className="flex-1 h-1 bg-navy rounded-full overflow-hidden ml-1">
                    <div className="h-full bg-layer-agent rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-layer-agent font-mono">{m.progress}%</span>
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

export default function ScaleEngine() {
  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Brand-by-Brand Deployment — Configured, Not Rebuilt</h3>
          <p className="text-[10px] text-gray-500">~6 weeks per brand. Costs decrease with each deployment.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          {[
            { label: 'Live', color: 'bg-risk-green' },
            { label: 'Deploying', color: 'bg-layer-agent' },
            { label: 'Planned', color: 'bg-gray-500' },
            { label: 'Template', color: 'bg-cap-blue' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
              <span className="text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brand cards grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3 overflow-auto">
        {scaleData.map((brand, i) => (
          <BrandCard key={brand.brand} brand={brand} index={i} />
        ))}
      </div>

      {/* Scale insight bar */}
      <div className="flex-none bg-navy-light rounded-xl border border-cap-blue/20 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-300">
            <span className="text-cap-cyan font-bold">Scale Engine:</span>
            {' '}Build once at AH → Configure per brand → SLM fine-tunes in 3 days by brand 10
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="text-center px-2">
              <span className="text-sm font-bold text-white">6</span>
              <p className="text-gray-500">wks/brand</p>
            </div>
            <div className="text-center px-2 border-l border-navy-mid">
              <span className="text-sm font-bold text-cap-cyan">16</span>
              <p className="text-gray-500">brands</p>
            </div>
            <div className="text-center px-2 border-l border-navy-mid">
              <span className="text-sm font-bold text-risk-green">7,000+</span>
              <p className="text-gray-500">stores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
