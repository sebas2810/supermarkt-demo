import { useState, useEffect } from 'react'
import dtData from '../data/digital_twin_workflow.json'

const b = dtData.burlington_nc

export default function DT2_BurlingtonNC({ onAction }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Digital Twin — DC Design</h3>
          <p className="text-sm font-semibold text-white">{b.dc_name}</p>
        </div>
        <span className="text-[10px] text-gray-500 bg-navy-light border border-navy-mid rounded-lg px-2 py-1 font-mono">
          {b.dc_id}
        </span>
      </div>

      {/* Two-column: Current vs Proposed Design */}
      <div className={`flex-1 min-h-0 grid grid-cols-2 gap-3 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Current Design */}
        <div className="bg-navy-light rounded-xl border border-risk-red/30 p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-risk-red" />
            <h4 className="text-xs font-semibold text-risk-red">Current Design</h4>
          </div>
          <ul className="space-y-1.5 mb-3">
            <li className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-risk-red mt-0.5">•</span>
              Single ambient handoff point
            </li>
            <li className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-risk-red mt-0.5">•</span>
              4.2h average temperature exceedance window
            </li>
            <li className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-risk-red mt-0.5">•</span>
              {b.similar_patterns} similar cold chain patterns recorded
            </li>
          </ul>

          {/* Visual: flow diagram */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="bg-navy rounded-lg border border-navy-mid px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Receiving</span>
              </div>
              <span className="text-gray-600 text-[10px]">→</span>
              <div className="relative bg-navy rounded-lg border border-risk-red/50 px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Ambient</span>
                <span className="text-[9px] text-gray-400 block">Handoff</span>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-risk-red rounded-full flex items-center justify-center text-[8px] text-white font-bold">!</span>
              </div>
              <span className="text-gray-600 text-[10px]">→</span>
              <div className="bg-navy rounded-lg border border-navy-mid px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Cold</span>
                <span className="text-[9px] text-gray-400 block">Storage</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[9px] text-risk-red/70 bg-risk-red/10 rounded px-2 py-0.5">
              4.2h exposure window
            </span>
          </div>
        </div>

        {/* Proposed Design */}
        <div className={`bg-navy-light rounded-xl border border-risk-green/30 p-3 flex flex-col transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-risk-green" />
            <h4 className="text-xs font-semibold text-risk-green">Proposed Design</h4>
          </div>
          <ul className="space-y-1.5 mb-3">
            <li className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-risk-green mt-0.5">•</span>
              Add second ambient handoff point at receiving dock
            </li>
            <li className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-risk-green mt-0.5">•</span>
              Reduces exposure from 4.2h to 1.8h average
            </li>
          </ul>

          {/* Visual: improved flow diagram */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="relative bg-navy rounded-lg border border-risk-green/50 px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Receiving</span>
                <span className="text-[9px] text-risk-green block">+ Handoff</span>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-risk-green rounded-full flex items-center justify-center text-[8px] text-white font-bold">✓</span>
              </div>
              <span className="text-gray-600 text-[10px]">→</span>
              <div className="bg-navy rounded-lg border border-navy-mid px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Ambient</span>
                <span className="text-[9px] text-gray-400 block">Handoff</span>
              </div>
              <span className="text-gray-600 text-[10px]">→</span>
              <div className="bg-navy rounded-lg border border-navy-mid px-2.5 py-1.5 text-center">
                <span className="text-[9px] text-gray-400 block">Cold</span>
                <span className="text-[9px] text-gray-400 block">Storage</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[9px] text-risk-green/70 bg-risk-green/10 rounded px-2 py-0.5">
              1.8h exposure window
            </span>
          </div>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className={`flex-none grid grid-cols-3 gap-3 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 text-center">
          <span className="text-sm font-bold text-white">{b.projected_stores.toLocaleString()}</span>
          <p className="text-[9px] text-gray-500 uppercase mt-0.5">Stores Impacted</p>
        </div>
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 text-center">
          <span className="text-sm font-bold text-risk-green">{b.waste_reduction_pct}%</span>
          <p className="text-[9px] text-gray-500 uppercase mt-0.5">Waste Reduction</p>
        </div>
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm font-bold text-risk-green">€{(b.annual_savings / 1_000_000).toFixed(1)}M</span>
            <span className="text-[9px] text-gray-500">savings</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-[10px] text-risk-amber">€{(b.implementation_cost / 1_000_000).toFixed(1)}M</span>
            <span className="text-[9px] text-gray-500">cost</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={`flex-none flex justify-center transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={() => onAction?.('runWhatIf')}
          className="px-6 py-2 bg-cap-cyan text-navy font-semibold text-xs rounded-lg hover:bg-cap-cyan/80 transition-colors"
        >
          Run What-If Analysis →
        </button>
      </div>
    </div>
  )
}
