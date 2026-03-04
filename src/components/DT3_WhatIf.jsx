import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import dtData from '../data/digital_twin_workflow.json'

/* Merge current & improved Monte Carlo distributions into a single dataset */
const buildChartData = () => {
  const map = new Map()
  dtData.burlington_nc.monte_carlo_current.forEach(d => {
    map.set(d.units, { units: d.units, current: d.probability, improved: 0 })
  })
  dtData.burlington_nc.monte_carlo_improved.forEach(d => {
    const existing = map.get(d.units)
    if (existing) {
      existing.improved = d.probability
    } else {
      map.set(d.units, { units: d.units, current: 0, improved: d.probability })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.units - b.units)
}

const CHART_DATA = buildChartData()

export default function DT3_WhatIf({ onAction }) {
  const [simRunning, setSimRunning] = useState(false)
  const [simProgress, setSimProgress] = useState(0)
  const [simComplete, setSimComplete] = useState(false)

  /* Auto-start simulation on mount */
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
          onAction?.('whatIfComplete')
        }
      }, 30)
    }, 500)
    return () => clearTimeout(startDelay)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dc = dtData.burlington_nc

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">What-If: Add 2nd Ambient Handoff Point</h3>
          <p className="text-[10px] text-gray-500">
            Monte Carlo simulation — {dc.dc_name}
          </p>
        </div>
        {simRunning && (
          <span className="text-[10px] text-cap-cyan font-semibold animate-pulse">
            Simulating... {simProgress}%
          </span>
        )}
        {simComplete && (
          <span className="text-[10px] text-risk-green font-semibold">
            ✓ 500 scenarios complete
          </span>
        )}
      </div>

      {/* Progress bar */}
      {simRunning && (
        <div className="flex-none h-1 bg-navy-mid rounded-full overflow-hidden">
          <div
            className="h-full bg-cap-cyan rounded-full transition-all duration-75"
            style={{ width: `${simProgress}%` }}
          />
        </div>
      )}

      {/* ── Scenario comparison cards ── */}
      <div className="flex-none grid grid-cols-2 gap-3">
        {/* Current design */}
        <div className="bg-navy-light rounded-xl border border-risk-amber/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">Current DC Design</h4>
          </div>
          <p className="text-[10px] text-gray-400 mb-2">Single handoff point</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Waste Rate</span>
              <span className="text-risk-amber font-bold">{dc.current_waste_rate}%</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Key Stat</span>
              <span className="text-risk-amber font-bold">2,600 avg waste units/week</span>
            </div>
          </div>
        </div>

        {/* Improved design */}
        <div className="bg-navy-light rounded-xl border border-risk-green/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">With 2nd Handoff Point</h4>
            <span className="text-[10px] text-risk-green bg-risk-green/10 px-1.5 py-0.5 rounded font-semibold">
              -{dc.waste_reduction_pct}% waste
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mb-2">Dual handoff point</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Waste Rate</span>
              <span className="text-risk-green font-bold">{dc.projected_waste_rate}%</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Key Stat</span>
              <span className="text-risk-green font-bold">2,384 avg waste units/week</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Monte Carlo chart ── */}
      <div
        className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col transition-opacity duration-700 ${
          simComplete ? 'opacity-100' : 'opacity-30'
        }`}
      >
        <div className="flex-none flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-gray-300">
            Monte Carlo Distribution — Waste Units/Week
          </h3>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FEB100]" />
              Current
            </span>
            <span className="flex items-center gap-1 text-[9px] text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00D5D0]" />
              Improved
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0" style={{ minHeight: '80px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
              <XAxis
                dataKey="units"
                tick={{ fill: '#6B7280', fontSize: 9 }}
                tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
                label={{ value: 'units', fill: '#6B7280', fontSize: 9, position: 'insideBottomRight', offset: -2 }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 9 }}
                tickFormatter={v => `${v}%`}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: '#121A38',
                  border: '1px solid #1E2642',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v, name) => [
                  `${v}%`,
                  name === 'current' ? 'Current Design' : 'Improved Design',
                ]}
                labelFormatter={v => `${v.toLocaleString()} units`}
              />
              <ReferenceLine
                x={2600}
                stroke="#FEB100"
                strokeDasharray="4 4"
                label={{ value: 'Avg Current', fill: '#FEB100', fontSize: 9, position: 'top' }}
              />
              <ReferenceLine
                x={2000}
                stroke="#00D5D0"
                strokeDasharray="4 4"
                label={{ value: 'Avg Improved', fill: '#00D5D0', fontSize: 9, position: 'top' }}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#FEB100"
                fill="#FEB100"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="improved"
                stroke="#00D5D0"
                fill="#00D5D0"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Cost-benefit summary ── */}
      <div className="flex-none bg-navy-light rounded-xl border border-navy-mid p-3">
        <h4 className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
          Cost-Benefit Summary
        </h4>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[9px] text-gray-400">Implementation</span>
            <p className="text-sm font-bold text-white">€2.4M</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">Annual Savings</span>
            <p className="text-sm font-bold text-risk-green">€8.9M</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">Payback</span>
            <p className="text-sm font-bold text-cap-cyan">{dc.payback_months} months</p>
          </div>
          <div>
            <span className="text-[9px] text-gray-400">Stores Impacted</span>
            <p className="text-sm font-bold text-white">{dc.projected_stores}</p>
          </div>
        </div>
      </div>

      {/* ── CTA button ── */}
      {simComplete && (
        <div className="flex-none flex justify-end animate-slide-in">
          <button
            onClick={() => onAction?.('seeModelLearning')}
            className="px-4 py-1.5 bg-risk-green text-navy font-semibold text-xs rounded-lg hover:bg-risk-green/80 transition-colors"
          >
            See Model Learning →
          </button>
        </div>
      )}
    </div>
  )
}
