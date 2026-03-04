import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import incident from '../data/synthetic_incident.json'

const DECAY_DATA = Array.from({ length: 49 }, (_, i) => {
  const hour = i
  const baseDecay = 100 * Math.exp(-0.025 * hour)
  const adjustedDecay = 100 * Math.exp(-0.038 * hour)
  return {
    hour,
    normal: Math.round(baseDecay * 10) / 10,
    adjusted: Math.round(adjustedDecay * 10) / 10,
  }
})

function AnimatedNumber({ value, duration = 1500, decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}

function RiskBar({ score, max = 10 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth((score / max) * 100), 400)
    return () => clearTimeout(t)
  }, [score, max])
  const color = score > 7 ? '#FF816E' : score > 5 ? '#FEB100' : '#00D5D0'
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Risk Score</span>
        <span className="font-bold" style={{ color }}>{score} / {max}</span>
      </div>
      <div className="h-2.5 bg-navy rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1500 ease-out" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function LayerML() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
      setTimeout(() => setStep(4), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Layer header */}
      <div className="flex-none flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-layer-ml/20 border border-layer-ml/40 flex items-center justify-center">
          <span className="text-layer-ml font-bold text-sm">ML</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-400">Databricks · MLflow · Delta Lake</h3>
          <p className="text-[10px] text-gray-500">Continuous processing — retrained nightly</p>
        </div>
        {step >= 1 && (
          <div className="ml-auto flex items-center gap-2 text-xs text-layer-ml animate-slide-in">
            <div className="w-2 h-2 rounded-full bg-layer-ml animate-pulse" />
            Processing incident data...
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Decay curve — 2 cols */}
        <div className={`col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden transition-opacity duration-700 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-none flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-300">Shelf-Life Decay Curve — {incident.sku}</h3>
            <span className="text-[10px] text-gray-500">Per SKU × store × season</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DECAY_DATA} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="hour" tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => v % 8 === 0 ? `+${v}h` : ''} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => `${v}%`} domain={[0, 100]} width={32} />
                <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} formatter={(v, name) => [`${v}%`, name === 'normal' ? 'Normal' : 'Cold Chain Impact']} labelFormatter={v => `Hour +${v}`} />
                <ReferenceLine y={20} stroke="#FF816E" strokeDasharray="6 3" label={{ value: 'Unsellable (20%)', fill: '#FF816E', fontSize: 9, position: 'right' }} />
                <ReferenceLine x={36} stroke="#FF816E" strokeDasharray="6 3" label={{ value: 'Thu 14:00', fill: '#FF816E', fontSize: 9, position: 'top' }} />
                <Area type="monotone" dataKey="normal" stroke="#0058AB" fill="#0058AB" fillOpacity={0.1} strokeWidth={2} name="normal" />
                <Area type="monotone" dataKey="adjusted" stroke="#FF816E" fill="#FF816E" fillOpacity={0.1} strokeWidth={2} name="adjusted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-none flex items-center gap-4 mt-1 text-[10px]">
            <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-cap-blue" /><span className="text-gray-500">Normal decay</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-risk-red" /><span className="text-gray-500">With cold chain (−{incident.shelf_life.reduction_hours}h)</span></div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Risk score */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Risk Assessment</h3>
            <RiskBar score={incident.predictions.risk_score} />
            <div className="mt-2 text-center">
              <span className="text-3xl font-bold text-risk-red"><AnimatedNumber value={incident.predictions.risk_score} /></span>
              <span className="text-sm text-gray-400 ml-1">/ 10</span>
              <p className="text-[10px] text-risk-red font-semibold mt-0.5">HIGH RISK OF WASTE</p>
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <span>Confidence:</span>
              <span className="text-white font-semibold">{Math.round(incident.predictions.confidence * 100)}%</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Impact Breakdown</h3>
            <div className="space-y-2">
              {[
                { color: 'bg-risk-red', label: 'Cold Chain Impact', value: `−${incident.shelf_life.reduction_hours}h shelf life`, sub: `${incident.cold_chain.exceedance_degrees_c}°C for ${incident.cold_chain.exceedance_duration_hours}h` },
                { color: 'bg-risk-amber', label: 'Sell-Through Lag', value: '−12h effective window', sub: `${Math.round(Math.abs(incident.sell_through.forecast_vs_actual) * 100)}% below forecast` },
                { color: 'bg-layer-ml', label: 'Net Risk Window', value: '14h to Thursday close', sub: null },
              ].map(item => (
                <div key={item.label} className="bg-navy/50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-gray-400">{item.label}</span>
                  </div>
                  <p className="text-xs text-white font-semibold">{item.value}</p>
                  {item.sub && <p className="text-[10px] text-gray-500">{item.sub}</p>}
                </div>
              ))}
              <div className="bg-risk-red/10 border border-risk-red/20 rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Predicted waste</span>
                  <span className="text-sm font-bold text-risk-red">{incident.predictions.waste_units_no_action.toLocaleString()} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
