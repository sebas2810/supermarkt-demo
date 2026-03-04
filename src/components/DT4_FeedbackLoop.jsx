import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import dtData from '../data/digital_twin_workflow.json'

const chartData = dtData.model_improvement.map((d) => ({
  ...d,
  label: `W${d.week}`,
}))

const PIPELINE_STEPS = ['Outcome', 'Validate', 'Retrain', 'Deploy', 'Monitor']

export default function DT4_FeedbackLoop({ onAction }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const confidenceColor = (val) => {
    if (val >= 90) return 'text-risk-green'
    if (val >= 85) return 'text-cap-cyan'
    return 'text-risk-amber'
  }

  const outcomeColor = (val) => {
    if (val === 'Success') return 'text-risk-green'
    return 'text-risk-amber'
  }

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Digital Twin — Feedback Loop &amp; Model Learning</h3>
          <p className="text-[10px] text-gray-500">Continuous improvement via outcome-driven retraining</p>
        </div>
        <span className="text-[10px] text-gray-500">{dtData.overview.weeks_active} weeks active</span>
      </div>

      {/* Top row: Two charts */}
      <div
        className={`flex-none grid grid-cols-2 gap-3 transition-all duration-700 ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {/* Left: MAPE Improvement */}
        <div className="rounded-xl border border-navy-mid bg-navy-light p-3">
          <p className="text-[10px] text-gray-400 font-semibold mb-2">MAPE Improvement</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#6B7280' }}
                  axisLine={{ stroke: '#1E2642' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[6, 20]}
                  tick={{ fontSize: 9, fill: '#6B7280' }}
                  axisLine={{ stroke: '#1E2642' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(v) => [`${v}%`, 'MAPE']}
                />
                <Line
                  type="monotone"
                  dataKey="mape"
                  stroke="#00D5D0"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#00D5D0' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-500">W1: 18.2%</span>
            <span className="text-[9px] text-risk-green font-semibold">W13: 8.4% (−54%)</span>
          </div>
        </div>

        {/* Right: Cumulative Interventions */}
        <div className="rounded-xl border border-navy-mid bg-navy-light p-3">
          <p className="text-[10px] text-gray-400 font-semibold mb-2">Cumulative Interventions</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#6B7280' }}
                  axisLine={{ stroke: '#1E2642' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#6B7280' }}
                  axisLine={{ stroke: '#1E2642' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(v) => [v, 'Interventions']}
                />
                <Bar dataKey="interventions" fill="#1DB8F2" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-gray-500 mt-1">
            <span className="text-cap-cyan font-semibold">847</span> total interventions across{' '}
            <span className="text-cap-cyan font-semibold">2</span> brands
          </p>
        </div>
      </div>

      {/* Recent Invocations Table */}
      <div
        className={`flex-1 min-h-0 rounded-xl border border-navy-mid bg-navy-light p-3 flex flex-col transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <p className="text-[10px] text-gray-400 font-semibold mb-2">Recent Invocations</p>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="text-gray-500 border-b border-navy-mid">
                <th className="text-left py-1 px-1 font-medium">Date</th>
                <th className="text-left py-1 px-1 font-medium">Incident</th>
                <th className="text-left py-1 px-1 font-medium">Brand</th>
                <th className="text-left py-1 px-1 font-medium">Category</th>
                <th className="text-left py-1 px-1 font-medium">Action</th>
                <th className="text-right py-1 px-1 font-medium">Units Saved</th>
                <th className="text-right py-1 px-1 font-medium">Confidence</th>
                <th className="text-left py-1 px-1 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {dtData.recent_invocations.map((row, i) => (
                <tr
                  key={row.incident}
                  className={i % 2 === 0 ? 'bg-navy/50' : 'bg-navy-light/50'}
                >
                  <td className="py-1 px-1 text-gray-400">{row.date}</td>
                  <td className="py-1 px-1 text-gray-300 font-mono">{row.incident}</td>
                  <td className="py-1 px-1 text-gray-300">{row.brand}</td>
                  <td className="py-1 px-1 text-gray-400">{row.category}</td>
                  <td className="py-1 px-1 text-gray-300">{row.action}</td>
                  <td className="py-1 px-1 text-right text-gray-300 font-semibold">
                    {row.units_saved.toLocaleString()}
                  </td>
                  <td className={`py-1 px-1 text-right font-semibold ${confidenceColor(row.confidence)}`}>
                    {row.confidence}%
                  </td>
                  <td className={`py-1 px-1 font-semibold ${outcomeColor(row.outcome)}`}>
                    {row.outcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retraining Pipeline */}
      <div
        className={`flex-none rounded-xl border border-navy-mid bg-navy-light p-3 transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <p className="text-[10px] text-gray-400 font-semibold mb-2">Retraining Pipeline</p>
        <div className="flex items-center justify-center gap-1">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className="rounded-lg border border-navy-mid bg-navy px-3 py-1.5 text-[10px] text-gray-300 font-medium whitespace-nowrap">
                {step}
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <svg width="16" height="10" viewBox="0 0 16 10" className="text-cap-cyan flex-none">
                  <path d="M0 5 L12 5 M9 1 L13 5 L9 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className={`flex-none flex justify-end transition-all duration-500 ${
          phase >= 3 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => onAction?.('seeGroupImpact')}
          className="px-4 py-1.5 rounded-lg bg-cap-cyan text-navy text-[11px] font-semibold hover:bg-cap-cyan/90 transition-colors"
        >
          See Group Impact →
        </button>
      </div>
    </div>
  )
}
