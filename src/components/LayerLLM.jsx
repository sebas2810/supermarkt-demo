import { useState, useEffect, useRef } from 'react'
import incident from '../data/synthetic_incident.json'

const PRECOMPUTED_BRIEF = `3,400 units of AH Bakery Ref 4421 (seeded sourdough, 400g) are at risk of unsold before Thursday 14:00 close. Contributing factors: (1) temperature exceedance of 2.3°C for 4.2 hours during Monday delivery from Bakker Bart Zaandam — estimated shelf life reduced by 18 hours; (2) sell-through rate 23% below RELEX forecast since Monday 08:00, consistent with 3-day pattern following Tuesday promotions at competitor Jumbo.

Recommended action: Markdown to €1.49 (from €2.29) across stores AH-0041 Almere Stad, AH-0087 Utrecht Leidseweg, AH-0112 Amsterdam Bijlmer before 11:00 Thursday.

Expected waste avoided: 2,800 units (82% of at-risk stock). Revenue recovered at markdown: €4,172. Net margin preserved vs full waste: €3,932.

Confidence: 91% — based on 847 historical interventions with comparable risk profiles at Albert Heijn bakery category.`

function TypewriterText({ text, speed = 20, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      indexRef.current++
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) { clearInterval(interval); onComplete?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="inline-block w-0.5 h-4 bg-layer-llm ml-0.5 animate-pulse" />}
    </span>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-layer-llm" style={{ animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}

export default function LayerLLM() {
  const [phase, setPhase] = useState(0)
  const [briefDone, setBriefDone] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 3000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Layer header */}
      <div className="flex-none flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-layer-llm/20 border border-layer-llm/40 flex items-center justify-center">
          <span className="text-layer-llm font-bold text-sm">LLM</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-400">Claude 3.5 Sonnet / GPT-4o via Azure API</h3>
          <p className="text-[10px] text-gray-500">Invoked on risk tier 2+ events only — synthesis & reasoning</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          {phase === 1 && (
            <div className="flex items-center gap-2 text-layer-llm animate-slide-in">
              <ThinkingDots />
              <span>Synthesising...</span>
            </div>
          )}
          {phase >= 2 && (
            <div className="flex items-center gap-2 text-risk-green animate-slide-in">
              <span>✓</span>
              <span>Brief generated in 8.2s</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Left: Input signals */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-0.5">Input Signals</h3>
          <p className="flex-none text-[10px] text-gray-500 mb-2">Data synthesised from all layers</p>

          <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
            {[
              { label: 'ML Risk Score', value: `${incident.predictions.risk_score}/10`, icon: 'ML' },
              { label: 'SLM Classification', value: 'Tier 3 — Auto', icon: 'SLM' },
              { label: 'Cold Chain', value: `+${incident.cold_chain.exceedance_degrees_c}°C / ${incident.cold_chain.exceedance_duration_hours}h`, icon: '🌡' },
              { label: 'Shelf Life', value: `−${incident.shelf_life.reduction_hours}h`, icon: '⏱' },
              { label: 'Sell-Through', value: `${Math.round(incident.sell_through.forecast_vs_actual * 100)}%`, icon: '📊' },
              { label: 'PRISM', value: 'Competitor promo', icon: '🏪' },
              { label: 'Supplier', value: 'Bakker Bart', icon: '🚛' },
              { label: 'At-Risk', value: `${incident.at_risk_units.toLocaleString()} units`, icon: '📦' },
            ].map((signal, i) => (
              <div key={signal.label} className={`flex items-center gap-2 bg-navy/50 rounded-lg px-2 py-1.5 transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="text-xs w-5 text-center">{signal.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-gray-400 block leading-tight">{signal.label}</span>
                  <span className="text-xs text-white font-semibold">{signal.value}</span>
                </div>
                {phase >= 1 && <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Decision brief — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          {/* Brief header */}
          <div className="flex-none flex items-center justify-between mb-2 pb-2 border-b border-navy-mid">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-ah-blue flex items-center justify-center text-[10px] font-bold">AH</div>
                <h3 className="text-xs font-semibold text-white">Decision Brief — Fresh Supply Chain Intelligence</h3>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {phase >= 2 ? 'Wednesday 12 March 2025 · 07:38 CET' : 'Generating...'}
              </p>
            </div>
            {phase >= 2 && briefDone && (
              <div className="px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
                <span className="text-[10px] text-risk-green font-semibold">Confidence: 91%</span>
              </div>
            )}
          </div>

          {/* Brief content */}
          <div className="flex-1 min-h-0 overflow-auto">
            {phase < 2 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                {phase >= 1 && (
                  <>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-layer-llm/10 border border-layer-llm/30 flex items-center justify-center">
                        <ThinkingDots />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">Synthesising incident data into decision brief</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Combining ML, SLM, supplier data, PRISM signals...</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-navy/50 rounded-lg p-3 border border-navy-mid/50">
                <div className="text-gray-200 leading-relaxed text-xs whitespace-pre-wrap">
                  <TypewriterText text={PRECOMPUTED_BRIEF} speed={15} onComplete={() => setBriefDone(true)} />
                </div>
              </div>
            )}
          </div>

          {/* Brief footer */}
          {phase >= 2 && briefDone && (
            <div className="flex-none mt-2 pt-2 border-t border-navy-mid flex items-center justify-between animate-slide-in">
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>Ref: {incident.incident_id}</span>
                <span>SKU: {incident.sku}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-gray-500">→</span>
                <span className="text-layer-agent font-semibold">Layer 4: Agentic SC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
