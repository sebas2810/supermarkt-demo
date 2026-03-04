import { useState, useEffect } from 'react'
import incident from '../data/synthetic_incident.json'

const CHECKS = incident.classification.guardrail_checks

function CheckLine({ check, delay, visible }) {
  const [state, setState] = useState('hidden')
  useEffect(() => {
    if (!visible) return
    const t1 = setTimeout(() => setState('checking'), delay)
    const t2 = setTimeout(() => setState('done'), delay + 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible, delay])

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
      state === 'hidden' ? 'opacity-0 translate-x-4' :
      state === 'checking' ? 'opacity-100 bg-layer-slm/5 border border-layer-slm/20' :
      'opacity-100 bg-risk-green/5 border border-risk-green/20'
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
        state === 'checking' ? 'bg-layer-slm/20 text-layer-slm animate-pulse' :
        state === 'done' ? 'bg-risk-green/20 text-risk-green' :
        'bg-navy-mid text-gray-500'
      }`}>
        {state === 'done' ? '✓' : state === 'checking' ? '…' : '—'}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white">{check.check} check</span>
        <span className="text-[10px] text-gray-500 ml-1">
          {state === 'done' ? `${check.actual}` : ''}
        </span>
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-opacity duration-300 ${
        state === 'done' ? 'opacity-100 bg-risk-green/20 text-risk-green' : 'opacity-0'
      }`}>
        {check.status}
      </span>
    </div>
  )
}

export default function LayerSLM() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Layer header */}
      <div className="flex-none flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-layer-slm/20 border border-layer-slm/40 flex items-center justify-center">
          <span className="text-layer-slm font-bold text-sm">SLM</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-400">Azure AI Studio · Fine-tuned Phi-3 / Mistral-7B</h3>
          <p className="text-[10px] text-gray-500">Low-latency classification — sub-7B parameters, quantised</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-gray-500">Latency:</span>
          <span className="text-layer-slm font-bold font-mono">1.2s</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Left: Classification checks */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-0.5">Real-Time Classification</h3>
          <p className="flex-none text-[10px] text-gray-500 mb-2">SLM processing ML output through guardrail matrix</p>

          <div className="flex-1 min-h-0 space-y-1.5 overflow-auto">
            {CHECKS.map((check, i) => (
              <CheckLine key={check.check} check={check} delay={i * 450} visible={phase >= 1} />
            ))}
          </div>

          {/* Classification result */}
          <div className={`flex-none mt-3 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-tier-3/10 border-2 border-tier-3/40 rounded-xl p-3 text-center glow-amber">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Classification Result</span>
              <div className="mt-1 flex items-center justify-center">
                <span className="text-2xl font-bold text-tier-3">RISK TIER 3</span>
              </div>
              <p className="text-xs text-tier-3 font-semibold">Autonomous Action Authorised</p>
            </div>
          </div>
        </div>

        {/* Right: Tier scale + Action params */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Tier scale */}
          <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Risk Tier Scale</h3>
            <div className="space-y-1">
              {[
                { tier: 0, label: 'No action required', textColor: 'text-gray-400' },
                { tier: 1, label: 'Flag for buyer review', textColor: 'text-cap-blue' },
                { tier: 2, label: 'Markdown pre-auth', textColor: 'text-layer-llm' },
                { tier: 3, label: 'Autonomous markdown', textColor: 'text-tier-3', active: true },
                { tier: 4, label: 'DC re-routing / cancel', textColor: 'text-risk-red' },
              ].map(t => (
                <div key={t.tier} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-500 ${
                  t.active && phase >= 2 ? 'bg-tier-3/10 border border-tier-3/30' : 'bg-navy/30'
                }`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${t.textColor}`}>{t.tier}</div>
                  <span className={`text-[10px] flex-1 ${t.active && phase >= 2 ? t.textColor + ' font-semibold' : 'text-gray-400'}`}>{t.label}</span>
                  {t.active && phase >= 2 && <span className="text-[10px] text-tier-3">← CURRENT</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Action parameters */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-all duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Extracted Action Parameters</h3>
            <div className="space-y-2">
              <div className="bg-navy/50 rounded-lg p-2">
                <span className="text-[10px] text-gray-400">Markdown Amount</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500 line-through">€{incident.recommended_action.original_price.toFixed(2)}</span>
                  <span className="text-lg font-bold text-risk-green">€{incident.recommended_action.markdown_price.toFixed(2)}</span>
                  <span className="text-xs text-tier-3 bg-tier-3/10 px-1.5 py-0.5 rounded">−{Math.round(incident.recommended_action.discount_pct * 100)}%</span>
                </div>
              </div>
              <div className="bg-navy/50 rounded-lg p-2">
                <span className="text-[10px] text-gray-400">Target Stores</span>
                <div className="mt-0.5 space-y-0.5">
                  {incident.stores_affected.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-layer-slm" />
                      <span className="text-xs text-white font-mono">{s.id}</span>
                      <span className="text-[10px] text-gray-400">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-navy/50 rounded-lg p-2">
                <span className="text-[10px] text-gray-400">Execution Window</span>
                <p className="text-xs text-white font-semibold mt-0.5">Before 11:00 Thursday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
