import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts'

/* ── Per-scenario distribution parameters ────────────────────────── */
/*
 *  All distributions are normalized to the same peak height (~100).
 *  This keeps the audience focused on WHERE each curve sits (units saved)
 *  while the WIDTH shows uncertainty (broader = less certain).
 *
 *  No Action  : narrow  (σ 160) — certain we save almost nothing
 *  Markdown   : medium  (σ 280) — confident intervention, moderate spread
 *  DC Re-Route: broad   (σ 380) — logistics uncertainty, wide spread
 */
const SCENARIO_DIST = {
  markdown:    { mean: 2650, sigma: 280, color: '#00D5D0', label: 'Markdown',    p10: 2100, p50: 2650, p90: 3100, expected: 2800, confidence: 91 },
  reroute:     { mean: 1900, sigma: 380, color: '#FEB100', label: 'DC Re-Route', p10: 1400, p50: 1900, p90: 2350, expected: 1900, confidence: 74 },
  'no-action': { mean: 350,  sigma: 160, color: '#FF816E', label: 'No Action',   p10: 0,    p50: 200,  p90: 650,  expected: 0,    confidence: 96 },
}

/* ── Build unified chart data with all 3 curves ──────────────────── */
const STEPS = 60
const X_MIN = 0
const X_MAX = 3600

// Normalized Gaussian: all peaks reach ~100, width (sigma) shows uncertainty
const gauss = (x, mean, sigma) =>
  Math.round(Math.exp(-0.5 * ((x - mean) / sigma) ** 2) * 1000) / 10

const MONTE_CARLO = Array.from({ length: STEPS }, (_, i) => {
  const x = X_MIN + i * ((X_MAX - X_MIN) / (STEPS - 1))
  return {
    units: Math.round(x),
    markdown:    gauss(x, SCENARIO_DIST.markdown.mean,    SCENARIO_DIST.markdown.sigma),
    reroute:     gauss(x, SCENARIO_DIST.reroute.mean,     SCENARIO_DIST.reroute.sigma),
    'no-action': gauss(x, SCENARIO_DIST['no-action'].mean, SCENARIO_DIST['no-action'].sigma),
  }
})

const SCENARIOS = [
  {
    id: 'markdown',
    title: 'Markdown',
    recommended: true,
    description: 'Reduce price to \u20AC1.49 across 3 stores before 11:00 Thursday',
    metrics: { wasteAvoided: 2800, revenue: 4172, cost: 2240, net: 3932 },
  },
  {
    id: 'reroute',
    title: 'DC Re-Route',
    recommended: false,
    description: 'Redirect stock to high-velocity stores in Amsterdam region',
    metrics: { wasteAvoided: 1900, revenue: 4351, cost: 890, net: 3461 },
  },
  {
    id: 'no-action',
    title: 'No Action',
    recommended: false,
    description: 'Let stock follow normal sell-through pattern',
    metrics: { wasteAvoided: 0, revenue: 920, cost: 0, net: -5815 },
  },
]

/* ── Custom tooltip ──────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, selected }) {
  if (!active || !payload?.length) return null
  const displayItems = selected
    ? payload.filter(p => p.dataKey === selected)
    : payload.filter(p => p.value > 0.5)  // hide near-zero curves in tooltip
  if (!displayItems.length) return null
  return (
    <div className="bg-[#121A38] border border-[#1E2642] rounded-lg px-3 py-2 text-[11px]">
      <p className="text-gray-400 mb-1">{Number(label).toLocaleString()} units waste avoided</p>
      {displayItems.map(p => (
        <p key={p.dataKey} style={{ color: SCENARIO_DIST[p.dataKey]?.color || '#888' }}>
          {SCENARIO_DIST[p.dataKey]?.label}: {p.value > 0 ? 'likely' : '—'}
        </p>
      ))}
    </div>
  )
}

/* ── Component ───────────────────────────────────────────────────── */
export default function S4_Simulation({ workflowState, onAction }) {
  const [simRunning, setSimRunning] = useState(false)
  const [simProgress, setSimProgress] = useState(0)
  const [simComplete, setSimComplete] = useState(false)
  const [selected, setSelected] = useState(null)

  // Auto-start simulation on mount
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setSimRunning(true)
      let p = 0
      const interval = setInterval(() => {
        p += 2
        setSimProgress(p)
        if (p >= 100) {
          clearInterval(interval)
          setSimRunning(false)
          setSimComplete(true)
          onAction?.('simulationRun')
        }
      }, 30)
    }, 500)
    return () => clearTimeout(startDelay)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectScenario = (id) => {
    setSelected(id)
    onAction?.('scenarioSelected', id)
  }

  // Active distribution for reference lines + stats
  const activeDist = selected ? SCENARIO_DIST[selected] : SCENARIO_DIST.markdown

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Digital Twin — Scenario Simulation</h3>
          <p className="text-[10px] text-gray-500">Compare outcomes before committing to action</p>
        </div>
        {simRunning && (
          <span className="text-[10px] text-cap-cyan font-semibold">Simulating... {simProgress}%</span>
        )}
        {simComplete && !selected && (
          <span className="text-[10px] text-cap-cyan animate-pulse">{'\u2190'} Select a scenario to proceed</span>
        )}
        {selected && (
          <button
            onClick={() => onAction?.('proceedToApproval')}
            className="px-4 py-1.5 bg-risk-green text-navy font-semibold text-xs rounded-lg hover:bg-risk-green/80 transition-colors"
          >
            Proceed to Approval →
          </button>
        )}
      </div>

      {/* Simulation progress bar */}
      {simRunning && (
        <div className="flex-none h-1 bg-navy-mid rounded-full overflow-hidden">
          <div className="h-full bg-cap-cyan rounded-full transition-all duration-75" style={{ width: `${simProgress}%` }} />
        </div>
      )}

      {/* Scenario cards */}
      <div className="flex-none grid grid-cols-3 gap-3">
        {SCENARIOS.map(sc => {
          const dist = SCENARIO_DIST[sc.id]
          return (
            <div
              key={sc.id}
              onClick={() => simComplete && selectScenario(sc.id)}
              className={`bg-navy-light rounded-xl border p-3 transition-all duration-300 ${
                selected === sc.id
                  ? 'ring-1 ring-opacity-30'
                  : sc.recommended && simComplete
                  ? 'border-risk-green/30 hover:border-risk-green/50 cursor-pointer'
                  : simComplete
                  ? 'border-navy-mid hover:border-gray-600 cursor-pointer'
                  : 'border-navy-mid opacity-70'
              }`}
              style={selected === sc.id ? { borderColor: dist.color, boxShadow: `0 0 0 1px ${dist.color}33` } : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dist.color }} />
                  <h4 className="text-sm font-semibold text-white">{sc.title}</h4>
                </div>
                {sc.recommended && (
                  <span className="text-[10px] text-risk-green bg-risk-green/10 px-1.5 py-0.5 rounded font-semibold">Recommended</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mb-2">{sc.description}</p>

              {simComplete && (
                <div className="space-y-1.5 animate-slide-in">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Waste Avoided</span>
                    <span className={`font-bold ${sc.metrics.wasteAvoided > 0 ? 'text-risk-green' : 'text-risk-red'}`}>
                      {sc.metrics.wasteAvoided.toLocaleString()} units
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-white font-bold">{'\u20AC'}{sc.metrics.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Net Benefit</span>
                    <span className={`font-bold ${sc.metrics.net > 0 ? 'text-risk-green' : 'text-risk-red'}`}>
                      {sc.metrics.net > 0 ? '' : '\u2212'}{'\u20AC'}{Math.abs(sc.metrics.net).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Monte Carlo chart */}
      <div className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col transition-opacity duration-700 ${simComplete ? 'opacity-100' : 'opacity-30'}`}>
        <div className="flex-none flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold text-gray-300">Monte Carlo Distribution — Waste Avoided</h3>
            {selected && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ color: activeDist.color, backgroundColor: `${activeDist.color}15` }}>
                {activeDist.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            {simComplete && (
              <div className="flex items-center gap-2">
                {Object.entries(SCENARIO_DIST).map(([id, d]) => (
                  <div key={id} className={`flex items-center gap-1 transition-opacity duration-300 ${selected && selected !== id ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[9px] text-gray-500">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
            <span className="text-[10px] text-gray-500">500 scenarios each</span>
          </div>
        </div>

        <div className="flex-1 min-h-0" style={{ minHeight: '80px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTE_CARLO} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
              <XAxis
                dataKey="units"
                tick={{ fill: '#6B7280', fontSize: 9 }}
                tickFormatter={v => v % 600 === 0 ? `${(v / 1000).toFixed(1)}k` : ''}
              />
              <YAxis
                tick={false}
                axisLine={false}
                tickLine={false}
                width={14}
                label={{ value: 'Likelihood', angle: -90, fill: '#4B5563', fontSize: 8, position: 'insideLeft', dy: 25 }}
              />
              <Tooltip content={<CustomTooltip selected={selected} />} />

              {/* 80% confidence band (P10–P90) */}
              <ReferenceArea
                x1={activeDist.p10}
                x2={activeDist.p90}
                fill={activeDist.color}
                fillOpacity={0.06}
                stroke={activeDist.color}
                strokeOpacity={0.15}
                strokeDasharray="3 3"
              />

              {/* Reference lines for P10, Expected, P90 */}
              <ReferenceLine x={activeDist.p10} stroke={activeDist.color} strokeDasharray="4 4" strokeOpacity={0.4}
                label={{ value: 'P10', fill: activeDist.color, fontSize: 9, position: 'top' }} />
              <ReferenceLine x={activeDist.expected || activeDist.p50} stroke={activeDist.color} strokeDasharray="2 2" strokeOpacity={0.8}
                label={{ value: 'Expected', fill: activeDist.color, fontSize: 9, position: 'top' }} />
              <ReferenceLine x={activeDist.p90} stroke={activeDist.color} strokeDasharray="4 4" strokeOpacity={0.4}
                label={{ value: 'P90', fill: activeDist.color, fontSize: 9, position: 'top' }} />

              {/* All 3 distribution curves — dim non-selected */}
              <Area
                type="monotone"
                dataKey="no-action"
                stroke={SCENARIO_DIST['no-action'].color}
                fill={SCENARIO_DIST['no-action'].color}
                fillOpacity={selected === 'no-action' ? 0.2 : selected ? 0.03 : 0.1}
                strokeOpacity={selected === 'no-action' ? 1 : selected ? 0.15 : 0.6}
                strokeWidth={selected === 'no-action' ? 2.5 : 1.5}
                animationDuration={600}
              />
              <Area
                type="monotone"
                dataKey="reroute"
                stroke={SCENARIO_DIST.reroute.color}
                fill={SCENARIO_DIST.reroute.color}
                fillOpacity={selected === 'reroute' ? 0.2 : selected ? 0.03 : 0.1}
                strokeOpacity={selected === 'reroute' ? 1 : selected ? 0.15 : 0.6}
                strokeWidth={selected === 'reroute' ? 2.5 : 1.5}
                animationDuration={600}
              />
              <Area
                type="monotone"
                dataKey="markdown"
                stroke={SCENARIO_DIST.markdown.color}
                fill={SCENARIO_DIST.markdown.color}
                fillOpacity={selected === 'markdown' ? 0.2 : selected ? 0.03 : 0.1}
                strokeOpacity={selected === 'markdown' ? 1 : selected ? 0.15 : 0.6}
                strokeWidth={selected === 'markdown' ? 2.5 : 1.5}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom: confidence range + score */}
        <div className="flex-none mt-1.5 flex items-center gap-2">
          {/* 80% Confidence Range */}
          <div className="flex-1 rounded-lg p-2 bg-navy/50 flex items-center gap-3">
            <div>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">80% Confidence Range</span>
              <p className="text-sm font-bold text-white">
                {activeDist.p10.toLocaleString()} – {activeDist.p90.toLocaleString()}
                <span className="text-[10px] text-gray-400 font-normal ml-1.5">units</span>
              </p>
            </div>
            {/* Visual range bar */}
            <div className="flex-1 relative h-5">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gray-700" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full"
                style={{
                  left: `${(activeDist.p10 / X_MAX) * 100}%`,
                  right: `${100 - (activeDist.p90 / X_MAX) * 100}%`,
                  backgroundColor: `${activeDist.color}30`,
                  border: `1px solid ${activeDist.color}50`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3.5 rounded-sm"
                style={{
                  left: `${((activeDist.expected || activeDist.p50) / X_MAX) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: activeDist.color,
                }}
              />
            </div>
          </div>

          {/* Expected outcome */}
          <div className="rounded-lg p-2 text-center min-w-[100px]" style={{ backgroundColor: `${activeDist.color}10`, border: `1px solid ${activeDist.color}25` }}>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">Expected</span>
            <p className="text-sm font-bold" style={{ color: activeDist.color }}>
              {activeDist.expected.toLocaleString()}
              <span className="text-[10px] font-normal ml-1">units</span>
            </p>
          </div>

          {/* Model confidence */}
          <div className="rounded-lg p-2 text-center min-w-[90px] bg-navy/50">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">Confidence</span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {/* Mini confidence bar */}
              <div className="w-10 h-1.5 rounded-full bg-navy-mid overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeDist.confidence}%`, backgroundColor: activeDist.confidence >= 85 ? '#00D5D0' : activeDist.confidence >= 70 ? '#FEB100' : '#FF816E' }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: activeDist.confidence >= 85 ? '#00D5D0' : activeDist.confidence >= 70 ? '#FEB100' : '#FF816E' }}>
                {activeDist.confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
