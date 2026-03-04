import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, BarChart, Bar
} from 'recharts'
import incident from '../data/synthetic_incident.json'
import AnimatedNumber from './shared/AnimatedNumber'
import { TypewriterText, ThinkingDots } from './shared/TypewriterText'

const TEMP_DATA = incident.cold_chain.temperature_readings.map(r => ({
  time: r.time,
  temp: r.temp,
  threshold: 4.0,
}))

// Full week sell-through data (all 5 days)
const SELL_THROUGH = incident.sell_through.daily_data.filter(d => d.actual !== null)

// Computed risk values
const VALUE_AT_RISK = incident.at_risk_units * incident.unit_price
const COST_OF_INACTION = incident.predictions.waste_units_no_action * incident.unit_price

const PRECOMPUTED_BRIEF = `3,400 units of AH Bakery Ref 4421 (seeded sourdough, 400g) are at risk of unsold before Thursday 14:00 close. Contributing factors: (1) temperature exceedance of 2.3\u00B0C for 4.2 hours during Monday delivery from Bakker Bart Zaandam \u2014 estimated shelf life reduced by 18 hours; (2) sell-through rate 23% below RELEX forecast since Monday, consistent with Jumbo's competing Tuesday promotion.

Recommended action: Markdown to \u20AC1.49 (from \u20AC2.29) across 3 stores before 11:00 Thursday. Expected waste avoided: 2,800 units (82%). Revenue recovered: \u20AC4,172. Net margin preserved: \u20AC3,932.

Confidence: 91% \u2014 based on 847 historical interventions at Albert Heijn bakery category.`

function TempTooltip({ active, payload }) {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="bg-navy-light border border-navy-mid rounded px-3 py-2 text-xs">
        <p className="text-gray-400">{d.time}</p>
        <p className={`font-bold ${d.temp > 4.0 ? 'text-risk-red' : 'text-risk-green'}`}>{d.temp}°C</p>
      </div>
    )
  }
  return null
}

function RiskBar({ score, max = 10 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth((score / max) * 100), 400)
    return () => clearTimeout(t)
  }, [score, max])
  const color = score > 7 ? '#FF816E' : score > 5 ? '#FEB100' : '#00D5D0'
  return (
    <div className="h-2 bg-navy rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-[1500ms] ease-out" style={{ width: `${width}%`, backgroundColor: color }} />
    </div>
  )
}

export default function S2_AlertAnalysis({ workflowState, onAction }) {
  const [phase, setPhase] = useState(0)
  const [briefDone, setBriefDone] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-3 flex flex-col gap-2 overflow-hidden">
      {/* Alert bar */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-risk-red/10 border border-risk-red/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-risk-red animate-pulse" />
          <span className="text-risk-red text-xs font-semibold">COLD CHAIN ALERT</span>
          <span className="text-[10px] text-gray-400">Ref: {incident.incident_id}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-gray-500">Detection:</span>
          <span className="text-white font-mono">06:15</span>
          <span className="text-gray-500">→</span>
          <span className="text-cap-cyan font-mono">Analysis: 07:30 CET</span>
        </div>
      </div>

      {/* Top row: 3 columns — Temp chart | Sell-through | Risk assessment */}
      <div className="flex-none grid grid-cols-3 gap-2" style={{ height: '42%' }}>
        {/* Col 1: Temperature chart */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-2.5 flex flex-col min-h-0">
          <div className="flex-none flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-gray-300">Cold Chain — Overnight Transit</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMP_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 8 }} interval={2} />
                <YAxis domain={[2, 8]} tick={{ fill: '#6B7280', fontSize: 8 }} tickFormatter={v => `${v}°`} width={25} />
                <Tooltip content={<TempTooltip />} />
                <ReferenceLine y={4.0} stroke="#FF816E" strokeDasharray="6 3" />
                <ReferenceArea x1="01:00" x2="05:30" fill="#FF816E" fillOpacity={0.08} />
                <Line type="monotone" dataKey="temp" stroke="#1DB8F2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-none text-[9px] text-risk-red font-semibold">
            Peak: {incident.cold_chain.peak_temp_c}°C (+{incident.cold_chain.exceedance_degrees_c}°C for {incident.cold_chain.exceedance_duration_hours}h)
          </div>
        </div>

        {/* Col 2: Full-week sell-through */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-2.5 flex flex-col min-h-0">
          <div className="flex-none flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-gray-300">Sell-Through vs RELEX Forecast</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SELL_THROUGH} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 9 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 8 }} width={28} />
                <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 10 }} />
                <Bar dataKey="forecast" fill="#0058AB" radius={[2, 2, 0, 0]} name="Forecast" />
                <Bar dataKey="actual" fill="#1DB8F2" radius={[2, 2, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-none flex items-center gap-2 text-[9px]">
            <span className="text-risk-amber font-bold">{'\u2212'}23% vs forecast</span>
            <span className="text-gray-500">· Jumbo promo</span>
          </div>
        </div>

        {/* Col 3: Risk assessment + value at risk */}
        <div className={`bg-navy-light rounded-xl border border-navy-mid p-2.5 flex flex-col gap-2 min-h-0 overflow-auto transition-opacity duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          {/* Risk score */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-300 mb-1">AI Risk Assessment</h3>
            <RiskBar score={incident.predictions.risk_score} />
            <div className="flex items-center justify-between mt-1">
              <div>
                <span className="text-2xl font-bold text-risk-red"><AnimatedNumber value={incident.predictions.risk_score} /></span>
                <span className="text-xs text-gray-400 ml-0.5">/ 10</span>
              </div>
              <span className="text-[9px] text-risk-red font-semibold">HIGH RISK</span>
            </div>
          </div>

          {/* Value at risk */}
          <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-risk-amber/5 border border-risk-amber/20 rounded-lg p-2">
              <span className="text-[9px] text-gray-400 uppercase">Value at Risk</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-risk-amber">{'\u20AC'}{VALUE_AT_RISK.toLocaleString()}</span>
                <span className="text-[9px] text-gray-500">{incident.at_risk_units.toLocaleString()} units × {'\u20AC'}{incident.unit_price}</span>
              </div>
            </div>
          </div>

          {/* Cost of inaction */}
          <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="bg-risk-red/5 border border-risk-red/20 rounded-lg p-2">
              <span className="text-[9px] text-gray-400 uppercase">Cost of Inaction</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-risk-red">{'\u20AC'}{COST_OF_INACTION.toLocaleString()}</span>
                <span className="text-[9px] text-gray-500">{incident.predictions.waste_units_no_action.toLocaleString()} units wasted</span>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <div className="bg-risk-red/10 border border-risk-red/30 rounded-lg p-1.5 text-center">
              <span className="text-[9px] text-gray-400">SLM Classification</span>
              <p className="text-xs font-bold text-risk-red">TIER 3 — Autonomous Action</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: AI Decision Brief */}
      <div className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col overflow-hidden transition-all duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-30'}`}>
        {/* Brief header */}
        <div className="flex-none flex items-center justify-between mb-2 pb-1.5 border-b border-navy-mid">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-ah-blue flex items-center justify-center text-[9px] font-bold">AH</div>
            <div>
              <h3 className="text-xs font-semibold text-white">AI Decision Brief — Fresh Supply Chain</h3>
              <p className="text-[9px] text-gray-500">
                {phase >= 3 ? 'Wednesday 12 March 2025 · 07:38 CET' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase < 3 && phase >= 1 && (
              <div className="flex items-center gap-1.5 text-[10px] text-cap-cyan">
                <ThinkingDots />
                <span>Synthesising...</span>
              </div>
            )}
            {phase >= 3 && (
              <span className="text-[9px] text-risk-green animate-slide-in">{'\u2713'} SLM + LLM pipeline</span>
            )}
            {briefDone && (
              <div className="px-1.5 py-0.5 bg-risk-green/10 border border-risk-green/30 rounded">
                <span className="text-[9px] text-risk-green font-semibold">91% confidence</span>
              </div>
            )}
          </div>
        </div>

        {/* Brief content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {phase < 3 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ThinkingDots />
                <p className="text-[10px] text-gray-500 mt-2">Combining ML risk, SLM classification, supplier data...</p>
              </div>
            </div>
          ) : (
            <div className="bg-navy/50 rounded-lg p-2.5 border border-navy-mid/50">
              <div className="text-gray-200 leading-relaxed text-[11px] whitespace-pre-wrap">
                <TypewriterText text={PRECOMPUTED_BRIEF} speed={10} onComplete={() => setBriefDone(true)} />
              </div>
            </div>
          )}
        </div>

        {/* CTA: Review Scenarios */}
        {briefDone && (
          <div className="flex-none mt-2 pt-2 border-t border-navy-mid flex items-center justify-between animate-slide-in">
            <div className="flex items-center gap-3 text-[9px] text-gray-500">
              <span>Ref: {incident.incident_id}</span>
              <span>SKU: {incident.sku} · {incident.description}</span>
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
  )
}
