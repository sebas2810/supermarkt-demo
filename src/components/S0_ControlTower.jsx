/**
 * S0_ControlTower — Supply Chain Control Tower
 *
 * Entry screen for the Predictive Fresh Supply Chain workflow.
 * Demonstrates real-time AI monitoring with live incident lifecycle:
 *   1. Incidents appear in the queue as MONITORING
 *   2. AI agents auto-resolve most (MONITORING → EXECUTING → AUTO-RESOLVED)
 *   3. Threshold breaches escalate for human investigation (→ ESCALATED)
 *
 * Data sources: IoT Sensors, RELEX Forecast, Weather API, POS Stream, Supplier Feed
 * AI layers: ML anomaly detection → SLM classification → LLM synthesis → Agentic execution
 *
 * Consumer Goods Forum — Food Waste / Agentic AI use case
 */
import { useState, useEffect, useRef } from 'react'
import Sparkline from './shared/Sparkline'
import data from '../data/command_center_data.json'

const STATUS_STYLES = {
  escalated:  { label: 'ESCALATED',    bg: 'bg-risk-red/10',   border: 'border-risk-red/30',   text: 'text-risk-red',   dot: 'bg-risk-red animate-pulse' },
  resolved:   { label: 'AUTO-RESOLVED', bg: 'bg-risk-green/10', border: 'border-risk-green/30', text: 'text-risk-green', dot: 'bg-risk-green' },
  executing:  { label: 'EXECUTING',     bg: 'bg-cap-cyan/10',   border: 'border-cap-cyan/30',   text: 'text-cap-cyan',   dot: 'bg-cap-cyan animate-pulse' },
  monitoring: { label: 'MONITORING',    bg: 'bg-risk-amber/10', border: 'border-risk-amber/30', text: 'text-risk-amber', dot: 'bg-risk-amber animate-pulse' },
}

const DATA_SOURCES = [
  { name: 'IoT Sensors', detail: '2,847 active', status: 'healthy', icon: '◈' },
  { name: 'RELEX Forecast', detail: 'Real-time sync', status: 'healthy', icon: '◆' },
  { name: 'Weather API', detail: '5 DC regions', status: 'healthy', icon: '◇' },
  { name: 'POS Stream', detail: '1,063 stores', status: 'healthy', icon: '⬡' },
  { name: 'Supplier Feed', detail: '142 suppliers', status: 'degraded', icon: '⊘' },
]

const SOURCE_STATUS = {
  healthy:  { color: 'text-risk-green', dot: 'bg-risk-green', label: 'OK' },
  degraded: { color: 'text-risk-amber', dot: 'bg-risk-amber', label: 'DELAY' },
  alert:    { color: 'text-risk-red',   dot: 'bg-risk-red',   label: 'DOWN' },
}

// Timeline of incidents that appear live
// Each has a delay (ms from queue becoming visible), an initial status, and a resolve delay
const LIVE_TIMELINE = [
  // Already-resolved incidents visible immediately (overnight history)
  { idx: 3, appearDelay: 0,    initialStatus: 'resolved',   resolveDelay: null },  // Frozen Transit
  { idx: 5, appearDelay: 0,    initialStatus: 'resolved',   resolveDelay: null },  // Seafood Temp
  // New incidents appearing in real time
  { idx: 1, appearDelay: 1500, initialStatus: 'monitoring',  resolveDelay: 2500 }, // Produce → auto-resolve
  { idx: 2, appearDelay: 3500, initialStatus: 'monitoring',  resolveDelay: 3000 }, // Dairy → executing → resolve
  { idx: 4, appearDelay: 5500, initialStatus: 'monitoring',  resolveDelay: 2000 }, // Bakery → auto-resolve
  // The escalation — cold chain breach
  { idx: 0, appearDelay: 8000, initialStatus: 'monitoring',  resolveDelay: null, escalateDelay: 3000 },
]

export default function S0_ControlTower({ onAction }) {
  const [phase, setPhase] = useState(0)
  const [scanCount, setScanCount] = useState(12347)
  const [anomalyCount, setAnomalyCount] = useState(21)
  const [resolvedPct, setResolvedPct] = useState(76)

  // Track which incidents are visible and their current status
  const [visibleIncidents, setVisibleIncidents] = useState([])
  // Track status overrides for animated transitions
  const [statusOverrides, setStatusOverrides] = useState({})
  // Track which rows just resolved (for flash animation)
  const [flashingRows, setFlashingRows] = useState({})

  const timersRef = useRef([])

  // Phase animation for UI sections
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Live incident timeline — starts after phase 2
  useEffect(() => {
    if (phase < 2) return

    const timers = []

    LIVE_TIMELINE.forEach((event) => {
      const incident = data.recent_interventions[event.idx]

      // Appear
      timers.push(setTimeout(() => {
        setVisibleIncidents(prev => {
          if (prev.find(v => v.id === incident.id)) return prev
          return [{ ...incident, _liveStatus: event.initialStatus }, ...prev]
        })
        // Bump anomaly count when new monitoring items appear
        if (event.initialStatus === 'monitoring') {
          setAnomalyCount(c => c + 1)
        }
      }, event.appearDelay))

      // Auto-resolve
      if (event.resolveDelay) {
        timers.push(setTimeout(() => {
          // First flash executing briefly
          setStatusOverrides(prev => ({ ...prev, [incident.id]: 'executing' }))

          timers.push(setTimeout(() => {
            setStatusOverrides(prev => ({ ...prev, [incident.id]: 'resolved' }))
            setFlashingRows(prev => ({ ...prev, [incident.id]: true }))
            setResolvedPct(p => Math.min(p + 1, 82))
            // Remove flash after animation
            timers.push(setTimeout(() => {
              setFlashingRows(prev => ({ ...prev, [incident.id]: false }))
            }, 1200))
          }, 1000))
        }, event.appearDelay + event.resolveDelay))
      }

      // Escalate (cold chain breach)
      if (event.escalateDelay) {
        timers.push(setTimeout(() => {
          setStatusOverrides(prev => ({ ...prev, [incident.id]: 'escalated' }))
          setFlashingRows(prev => ({ ...prev, [incident.id]: 'escalated' }))
        }, event.appearDelay + event.escalateDelay))
      }
    })

    timersRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, [phase])

  // Animate scan counter
  useEffect(() => {
    if (phase < 4) return
    const interval = setInterval(() => {
      setScanCount(c => c + Math.floor(Math.random() * 3) + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [phase])

  // Get effective status for a row
  const getStatus = (item) => statusOverrides[item.id] || item._liveStatus || item.status
  const isEscalated = (item) => getStatus(item) === 'escalated' && item.isHighlight

  return (
    <div className="h-full p-2.5 flex flex-col gap-1.5 overflow-hidden">
      {/* Header bar */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-risk-green animate-pulse" />
            <span className="text-[10px] text-risk-green font-semibold uppercase tracking-wider">Live</span>
          </div>
          <div className="h-3.5 w-px bg-navy-mid" />
          <span className="text-[10px] text-gray-500">Wednesday 12 March 2025 · 07:30 CET</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cap-blue flex items-center justify-center text-[8px] font-bold text-white">KC</div>
            <span className="text-[10px] text-gray-400">Karin Chu · Category Manager Fresh</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-navy-light rounded border border-navy-mid">
            <span className="text-[9px] text-gray-500">Stores: <span className="text-white font-semibold">1,063</span></span>
            <div className="w-px h-3 bg-navy-mid" />
            <span className="text-[9px] text-gray-500">DCs: <span className="text-white font-semibold">5</span></span>
            <div className="w-px h-3 bg-navy-mid" />
            <span className="text-[9px] text-gray-500">SKUs: <span className="text-white font-semibold">2,847</span></span>
          </div>
        </div>
      </div>

      {/* Overnight Summary Banner */}
      <div className={`flex-none bg-cap-blue/10 border border-cap-blue/30 rounded-lg px-3 py-1.5 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-cap-cyan font-semibold uppercase tracking-wider">Overnight Summary</span>
            <div className="h-3 w-px bg-cap-blue/30" />
            <span className="text-[10px] text-gray-300">
              <span className="text-risk-green font-bold">18</span> incidents auto-resolved
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-risk-green font-bold">€47.2K</span> waste prevented
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-risk-red font-bold">2</span> items need your attention
            </span>
          </div>
          <span className="text-[8px] text-gray-500">00:00 — 07:30 CET</span>
        </div>
      </div>

      {/* Orchestration Stats — compact single row */}
      <div className={`flex-none grid grid-cols-6 gap-1.5 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {data.orchestration_stats.map((stat) => (
          <div key={stat.label} className="bg-navy-light rounded-lg border border-navy-mid px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[7px] text-gray-500 uppercase tracking-wider leading-tight">{stat.label}</span>
              {stat.suffix && <span className="text-[7px] text-gray-600 uppercase">{stat.suffix}</span>}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-base font-bold leading-tight" style={{ color: stat.color }}>{stat.value}</span>
              <Sparkline data={stat.trend} color={stat.color} height={16} width={48} />
            </div>
          </div>
        ))}
      </div>

      {/* Intervention Queue — takes remaining space */}
      <div className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid flex flex-col transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        {/* Queue header */}
        <div className="flex-none flex items-center justify-between px-3 py-1.5 border-b border-navy-mid/50">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold text-gray-300">Live Intervention Queue</h3>
            <span className="text-[8px] text-gray-500 font-mono">Agentic SC</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['All', 'Active', 'Escalated'].map((filter, i) => (
              <button key={filter} className={`px-2 py-0.5 rounded text-[8px] ${i === 0 ? 'bg-cap-blue/20 text-cap-cyan border border-cap-cyan/30' : 'text-gray-500 hover:text-gray-300'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="flex-none grid grid-cols-[72px_1fr_70px_50px_90px_36px] gap-1 px-3 py-1 text-[7px] text-gray-600 uppercase tracking-wider border-b border-navy-mid/30">
          <span>Status</span>
          <span>Alert</span>
          <span>DC</span>
          <span>Units</span>
          <span>Action</span>
          <span>Time</span>
        </div>

        {/* Table rows — live animated */}
        <div className="flex-1 min-h-0 overflow-auto">
          {visibleIncidents.length === 0 && phase >= 2 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cap-cyan animate-pulse" />
                <span className="text-[10px] text-gray-500">Scanning data sources...</span>
              </div>
            </div>
          )}
          {visibleIncidents.map((item) => {
            const effectiveStatus = getStatus(item)
            const style = STATUS_STYLES[effectiveStatus]
            const escalated = isEscalated(item)
            const flashing = flashingRows[item.id]

            return (
              <div
                key={item.id}
                className={`grid grid-cols-[72px_1fr_70px_50px_90px_36px] gap-1 px-3 py-1.5 items-center border-b border-navy-mid/20 animate-slide-in-row ${
                  escalated
                    ? 'bg-risk-red/5 border-l-2 border-l-risk-red glow-red'
                    : flashing === true
                    ? 'bg-risk-green/10'
                    : flashing === 'escalated'
                    ? 'bg-risk-red/10'
                    : ''
                }`}
                style={{
                  transition: 'background-color 0.8s ease',
                }}
              >
                {/* Status badge */}
                <div className={`flex items-center gap-1 px-1 py-0.5 rounded ${style.bg} ${style.border} border transition-all duration-500`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-[6.5px] font-semibold ${style.text} whitespace-nowrap`}>{style.label}</span>
                </div>

                {/* Alert + detection source */}
                <div className="min-w-0">
                  <p className={`text-[10px] truncate ${escalated ? 'text-white font-semibold' : 'text-gray-300'}`}>{item.alert}</p>
                  <p className="text-[8px] text-gray-500 truncate">
                    {escalated
                      ? 'IoT + RELEX + Shelf-life model'
                      : `${item.brand} · ${item.sku}`
                    }
                  </p>
                </div>

                {/* DC */}
                <span className="text-[9px] text-gray-400 truncate">{item.dc}</span>

                {/* Units */}
                <span className={`text-[10px] font-mono ${escalated ? 'text-risk-red font-bold' : 'text-gray-300'}`}>
                  {item.units.toLocaleString()}
                </span>

                {/* Action */}
                {escalated ? (
                  <button
                    onClick={() => onAction?.('investigate')}
                    className="px-2 py-0.5 bg-cap-cyan text-navy font-semibold text-[9px] rounded-lg hover:bg-cap-cyan/80 transition-colors whitespace-nowrap"
                  >
                    Investigate →
                  </button>
                ) : (
                  <span className={`text-[9px] ${
                    effectiveStatus === 'executing' ? 'text-cap-cyan' :
                    effectiveStatus === 'resolved' ? 'text-risk-green' :
                    effectiveStatus === 'monitoring' ? 'text-risk-amber' :
                    'text-gray-400'
                  } truncate transition-colors duration-500`}>
                    {effectiveStatus === 'monitoring' ? 'Analyzing...' :
                     effectiveStatus === 'executing' ? 'Executing fix...' :
                     item.action}
                  </span>
                )}

                {/* Time */}
                <span className="text-[9px] text-gray-500 font-mono">{item.time}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Monitoring & Data Sources */}
      <div className={`flex-none bg-navy-light rounded-lg border border-navy-mid px-3 py-1.5 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-3">
          {/* Data Sources */}
          <div className="flex items-center gap-2.5 flex-1">
            <span className="text-[7px] text-gray-600 uppercase tracking-wider flex-none">Sources</span>
            {DATA_SOURCES.map((src) => {
              const st = SOURCE_STATUS[src.status]
              return (
                <div key={src.name} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  <span className="text-[8px] text-gray-400">{src.name}</span>
                </div>
              )
            })}
          </div>

          <div className="w-px h-4 bg-navy-mid flex-none" />

          {/* AI Processing stats */}
          <div className="flex items-center gap-3 flex-none">
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-gray-500">Scanned:</span>
              <span className="text-[8px] text-cap-cyan font-mono font-semibold">{scanCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-gray-500">Anomalies:</span>
              <span className="text-[8px] text-risk-amber font-mono font-semibold">{anomalyCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-gray-500">Auto-resolved:</span>
              <span className="text-[8px] text-risk-green font-mono font-semibold">{resolvedPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
