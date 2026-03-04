import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, BarChart, Bar
} from 'recharts'
import incident from '../data/synthetic_incident.json'
import AnimatedNumber from './shared/AnimatedNumber'

const TEMP_DATA = incident.cold_chain.temperature_readings.map(r => ({
  time: r.time,
  temp: r.temp,
  threshold: 4.0,
}))

const SELL_THROUGH = incident.sell_through.daily_data.filter(d => d.actual !== null)

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
    <div className="w-full">
      <div className="h-2.5 bg-navy rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-[1500ms] ease-out" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function S2_AlertDetection() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Alert bar */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-risk-red/10 border border-risk-red/30 rounded-lg glow-red">
          <div className="w-2 h-2 rounded-full bg-risk-red animate-pulse" />
          <span className="text-risk-red text-xs font-semibold">COLD CHAIN ALERT</span>
          <span className="text-xs text-gray-400">Ref: {incident.incident_id}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Detection:</span>
          <span className="text-white font-mono">06:15 CET</span>
          <span className="text-gray-500">→ Analysis:</span>
          <span className="text-cap-cyan font-mono">07:30 CET</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Temperature chart — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-none flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-300">Cold Chain Temperature — Overnight Transit</h3>
            <span className="text-xs text-gray-500">{incident.supplier} → {incident.dc}</span>
          </div>
          <div className="flex-1 min-h-0" style={{ minHeight: '100px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMP_DATA} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} interval={1} />
                <YAxis domain={[2, 8]} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={v => `${v}\u00B0C`} width={35} />
                <Tooltip content={<TempTooltip />} />
                <ReferenceLine y={4.0} stroke="#FF816E" strokeDasharray="6 3" label={{ value: '4.0\u00B0C Threshold', fill: '#FF816E', fontSize: 9, position: 'right' }} />
                <ReferenceArea x1="01:00" x2="05:30" fill="#FF816E" fillOpacity={0.08} />
                <Line type="monotone" dataKey="temp" stroke="#1DB8F2" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#1DB8F2' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-none flex items-center gap-4 mt-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-risk-red opacity-50" />
              <span className="text-gray-500">Threshold</span>
            </div>
            <span className="text-risk-red font-semibold">
              Peak: {incident.cold_chain.peak_temp_c}°C (+{incident.cold_chain.exceedance_degrees_c}°C for {incident.cold_chain.exceedance_duration_hours}h)
            </span>
          </div>
        </div>

        {/* Right column — risk + summary */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Risk score */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">AI Risk Assessment</h3>
            <RiskBar score={incident.predictions.risk_score} />
            <div className="mt-2 text-center">
              <span className="text-3xl font-bold text-risk-red"><AnimatedNumber value={incident.predictions.risk_score} /></span>
              <span className="text-sm text-gray-400 ml-1">/ 10</span>
              <p className="text-[10px] text-risk-red font-semibold mt-0.5">HIGH RISK — IMMEDIATE ACTION REQUIRED</p>
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <span>Confidence:</span>
              <span className="text-white font-semibold">{Math.round(incident.predictions.confidence * 100)}%</span>
            </div>
          </div>

          {/* Impact breakdown */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Impact Summary</h3>
            <div className="space-y-1.5">
              {[
                ['SKU', incident.sku, 'font-mono'],
                ['Product', incident.description],
                ['Units at Risk', incident.at_risk_units.toLocaleString(), 'text-risk-amber font-bold'],
                ['Shelf Life', `\u2212${incident.shelf_life.reduction_hours}h`, 'text-risk-red font-bold'],
                ['Stores', `${incident.stores_affected.length} stores`],
                ['Predicted Waste', `${incident.predictions.waste_units_no_action.toLocaleString()} units`, 'text-risk-red font-bold'],
              ].map(([label, value, cls = 'text-white']) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sell-through bar */}
      <div className="flex-none h-24 bg-navy-light rounded-xl border border-navy-mid p-3 flex">
        <div className="w-44 flex-none">
          <h3 className="text-xs font-semibold text-gray-300 mb-1">Sell-Through vs RELEX Forecast</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-risk-amber">{'\u2212'}23%</span>
            <span className="text-[10px] text-gray-400">vs forecast · competitor promo</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SELL_THROUGH} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="forecast" fill="#0058AB" radius={[2, 2, 0, 0]} name="Forecast" />
              <Bar dataKey="actual" fill="#1DB8F2" radius={[2, 2, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
