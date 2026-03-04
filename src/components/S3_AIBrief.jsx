import { useState, useEffect } from 'react'
import incident from '../data/synthetic_incident.json'
import { TypewriterText, ThinkingDots } from './shared/TypewriterText'

const PRECOMPUTED_BRIEF = `3,400 units of AH Bakery Ref 4421 (seeded sourdough, 400g) are at risk of unsold before Thursday 14:00 close. Contributing factors: (1) temperature exceedance of 2.3\u00B0C for 4.2 hours during Monday delivery from Bakker Bart Zaandam \u2014 estimated shelf life reduced by 18 hours; (2) sell-through rate 23% below RELEX forecast since Monday 08:00, consistent with 3-day pattern following Tuesday promotions at competitor Jumbo.

Recommended action: Markdown to \u20AC1.49 (from \u20AC2.29) across stores AH-0041 Almere Stad, AH-0087 Utrecht Leidseweg, AH-0112 Amsterdam Bijlmer before 11:00 Thursday.

Expected waste avoided: 2,800 units (82% of at-risk stock). Revenue recovered at markdown: \u20AC4,172. Net margin preserved vs full waste: \u20AC3,932.

Confidence: 91% \u2014 based on 847 historical interventions with comparable risk profiles at Albert Heijn bakery category.`

export default function S3_AIBrief({ workflowState, onAction }) {
  const [phase, setPhase] = useState(0)
  const [briefDone, setBriefDone] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          {phase < 3 && phase >= 1 && (
            <div className="flex items-center gap-2 text-cap-cyan animate-slide-in">
              <ThinkingDots />
              <span>AI synthesising incident data...</span>
            </div>
          )}
          {phase >= 3 && (
            <div className="flex items-center gap-2 text-risk-green animate-slide-in">
              <span>{'\u2713'}</span>
              <span>Analysis complete — SLM + LLM pipeline</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Left: Input signals + classification */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-0.5">Input Signals</h3>
          <p className="flex-none text-[10px] text-gray-500 mb-2">Data synthesised from all layers</p>

          <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
            {[
              { label: 'ML Risk Score', value: `${incident.predictions.risk_score}/10`, icon: '\uD83E\uDDE0' },
              { label: 'Classification', value: 'Tier 3 \u2014 Auto', icon: '\uD83C\uDFF7' },
              { label: 'Cold Chain', value: `+${incident.cold_chain.exceedance_degrees_c}\u00B0C / ${incident.cold_chain.exceedance_duration_hours}h`, icon: '\uD83C\uDF21' },
              { label: 'Shelf Life', value: `\u2212${incident.shelf_life.reduction_hours}h`, icon: '\u23F1' },
              { label: 'Sell-Through', value: `${Math.round(incident.sell_through.forecast_vs_actual * 100)}%`, icon: '\uD83D\uDCCA' },
              { label: 'Competitor', value: 'Jumbo promo active', icon: '\uD83C\uDFEA' },
              { label: 'Supplier', value: 'Bakker Bart', icon: '\uD83D\uDE9B' },
              { label: 'At-Risk', value: `${incident.at_risk_units.toLocaleString()} units`, icon: '\uD83D\uDCE6' },
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

          {/* SLM classification result */}
          <div className={`flex-none mt-2 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-risk-red/10 border border-risk-red/30 rounded-lg p-2 text-center">
              <span className="text-[10px] text-gray-400 uppercase">SLM Classification</span>
              <p className="text-sm font-bold text-risk-red mt-0.5">RISK TIER 3</p>
              <p className="text-[10px] text-risk-red">Autonomous Action Authorised</p>
            </div>
          </div>
        </div>

        {/* Right: Decision brief — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          {/* Brief header */}
          <div className="flex-none flex items-center justify-between mb-2 pb-2 border-b border-navy-mid">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-ah-blue flex items-center justify-center text-[10px] font-bold">AH</div>
                <h3 className="text-xs font-semibold text-white">AI Decision Brief — Fresh Supply Chain</h3>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {phase >= 3 ? 'Wednesday 12 March 2025 · 07:38 CET' : 'Generating...'}
              </p>
            </div>
            {briefDone && (
              <div className="px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
                <span className="text-[10px] text-risk-green font-semibold">Confidence: 91%</span>
              </div>
            )}
          </div>

          {/* Brief content */}
          <div className="flex-1 min-h-0 overflow-auto">
            {phase < 3 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                {phase >= 1 && (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-cap-cyan/10 border border-cap-cyan/30 flex items-center justify-center">
                      <ThinkingDots />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">Synthesising incident data into decision brief</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Combining ML risk, SLM classification, supplier data...</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-navy/50 rounded-lg p-3 border border-navy-mid/50">
                <div className="text-gray-200 leading-relaxed text-xs whitespace-pre-wrap">
                  <TypewriterText text={PRECOMPUTED_BRIEF} speed={12} onComplete={() => setBriefDone(true)} />
                </div>
              </div>
            )}
          </div>

          {/* Button: Review Scenarios */}
          {briefDone && (
            <div className="flex-none mt-2 pt-2 border-t border-navy-mid flex items-center justify-between animate-slide-in">
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>Ref: {incident.incident_id}</span>
                <span>SKU: {incident.sku}</span>
              </div>
              <button
                onClick={() => onAction?.('briefRead')}
                className="px-4 py-1.5 bg-cap-cyan text-navy font-semibold text-xs rounded-lg hover:bg-cap-cyan/80 transition-colors"
              >
                Review Scenarios →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
