import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import incident from '../data/synthetic_incident.json'

const MONTE_CARLO = Array.from({ length: 40 }, (_, i) => {
  const x = 1800 + i * 40
  const mean = 2650
  const sigma = 300
  const y = Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2)) * 100
  return { units: x, probability: Math.round(y * 10) / 10 }
})

const MODEL_IMPROVEMENT = incident.digital_twin.model_improvement

export default function LayerTwin() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Layer header */}
      <div className="flex-none flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-layer-twin/20 border border-layer-twin/40 flex items-center justify-center">
          <span className="text-layer-twin font-bold text-sm">DT</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-400">Databricks Delta Live Tables · Azure Digital Twins</h3>
          <p className="text-[10px] text-gray-500">Simulation, scenario planning, and closed-loop learning</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Panel A: Monte Carlo */}
        <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden transition-opacity duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-none flex items-center justify-between mb-0.5">
            <h3 className="text-xs font-semibold text-gray-300">Pre-Action Simulation</h3>
            <span className="text-[10px] text-gray-500">500-scenario Monte Carlo</span>
          </div>
          <p className="flex-none text-[10px] text-gray-500 mb-1">Waste-avoided distribution — validates decision</p>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTE_CARLO} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="units" tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => v % 400 === 0 ? `${(v / 1000).toFixed(1)}k` : ''} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => `${v}%`} width={30} />
                <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, 'Probability']} labelFormatter={v => `${v} units`} />
                <ReferenceLine x={2100} stroke="#0058AB" strokeDasharray="4 4" label={{ value: 'P10', fill: '#0058AB', fontSize: 9, position: 'top' }} />
                <ReferenceLine x={2800} stroke="#00D5D0" strokeDasharray="4 4" label={{ value: 'Actual', fill: '#00D5D0', fontSize: 9, position: 'top' }} />
                <ReferenceLine x={3100} stroke="#0058AB" strokeDasharray="4 4" label={{ value: 'P90', fill: '#0058AB', fontSize: 9, position: 'top' }} />
                <Area type="monotone" dataKey="probability" stroke="#00D5D0" fill="#00D5D0" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-none mt-1 grid grid-cols-4 gap-1.5 text-center">
            {[
              { label: 'P10', value: incident.digital_twin.waste_avoided_p10, color: 'text-risk-amber', bg: '' },
              { label: 'P50', value: incident.digital_twin.waste_avoided_p50, color: 'text-white', bg: '' },
              { label: 'P90', value: incident.digital_twin.waste_avoided_p90, color: 'text-risk-amber', bg: '' },
              { label: 'Actual', value: 2800, color: 'text-risk-green', bg: 'bg-risk-green/10 border border-risk-green/20' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-1.5 ${s.bg || 'bg-navy/50'}`}>
                <span className="text-[10px] text-gray-400">{s.label}</span>
                <p className={`text-xs font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="flex-none mt-1 flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
            <span className="text-[10px] text-risk-green">Actual within 90th percentile confidence</span>
          </div>
        </div>

        {/* Panel B: Learning Loop + Burlington */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 flex-1 flex flex-col min-h-0 overflow-hidden transition-opacity duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-none flex items-center justify-between mb-0.5">
              <h3 className="text-xs font-semibold text-gray-300">Model Improvement</h3>
              <span className="text-[10px] text-gray-500">MAPE over 90 days</span>
            </div>
            <p className="flex-none text-[10px] text-gray-500 mb-1">Each intervention improves accuracy</p>

            <div className="flex-1 min-h-0" style={{ minHeight: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MODEL_IMPROVEMENT} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                  <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => `W${v}`} />
                  <YAxis domain={[6, 20]} tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => `${v}%`} width={28} />
                  <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, 'MAPE']} labelFormatter={v => `Week ${v}`} />
                  <Line type="monotone" dataKey="mape" stroke="#00D5D0" strokeWidth={2.5} dot={{ fill: '#00D5D0', r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-none mt-1 flex items-center justify-between text-[10px]">
              <span className="text-gray-400">W1: <span className="text-white">18.2%</span></span>
              <span className="text-risk-green font-semibold">W13: 8.4% (−54%)</span>
            </div>
          </div>

          {/* Burlington NC */}
          <div className={`flex-none bg-navy-light rounded-xl border border-cap-blue/30 p-3 transition-all duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">🏭</span>
              <h3 className="text-xs font-semibold text-cap-blue">Burlington NC — DC Digital Twin</h3>
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed">
              {incident.digital_twin.burlington_note}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
