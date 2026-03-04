import { useState, useEffect, useRef } from 'react'
import incident from '../data/synthetic_incident.json'

const ACTIONS = incident.agent_actions

export default function LayerAgent() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count > ACTIONS.length) {
        clearInterval(interval)
        setTimeout(() => setShowSummary(true), 500)
        return
      }
      setVisibleCount(count)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [visibleCount])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Layer header */}
      <div className="flex-none flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-layer-agent/20 border border-layer-agent/40 flex items-center justify-center">
          <span className="text-layer-agent text-xs font-bold">R2.0</span>
        </div>
        <div>
          <h3 className="text-xs text-gray-400">RAISE 2.0 · Agentic AI Platform</h3>
          <p className="text-[10px] text-gray-500">Proven at Action (4,500 stores) · Heineken (70+ OpCos)</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-navy-light rounded-lg border border-navy-mid">
            <div className={`w-2 h-2 rounded-full ${visibleCount < ACTIONS.length ? 'bg-layer-agent animate-pulse' : 'bg-risk-green'}`} />
            <span className="text-gray-400 text-[10px]">{visibleCount < ACTIONS.length ? 'Executing...' : 'Complete'}</span>
          </div>
          <span className="font-mono text-gray-500 text-[10px]">{visibleCount}/{ACTIONS.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Agent action log — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-none flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-300">Agent Execution Log</h3>
            <span className="text-[10px] text-gray-500 font-mono">RAISE 2.0 · Audit Trail</span>
          </div>

          <div ref={logRef} className="flex-1 min-h-0 bg-[#0a0c14] rounded-lg p-3 font-mono text-[11px] overflow-auto border border-[#1a1e30]">
            {ACTIONS.slice(0, visibleCount).map((action, i) => {
              const isExecuting = action.status === 'executing'
              const isLatest = i === visibleCount - 1
              return (
                <div key={i} className={`flex items-start gap-2 py-1 ${isLatest ? 'animate-slide-in' : ''}`}>
                  <span className="text-gray-600 flex-none w-14">{action.time}</span>
                  <span className={`flex-none w-3 ${isExecuting ? 'text-layer-agent' : 'text-risk-green'}`}>
                    {isExecuting ? '→' : '✓'}
                  </span>
                  <span className={`${isExecuting ? 'text-layer-agent' : 'text-gray-300'} ${isLatest ? 'text-white' : ''}`}>
                    {action.action}
                  </span>
                </div>
              )
            })}
            {visibleCount < ACTIONS.length && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-layer-agent animate-pulse">▊</span>
              </div>
            )}
          </div>

          {showSummary && (
            <div className="flex-none mt-2 bg-risk-green/5 border border-risk-green/20 rounded-lg p-2.5 animate-slide-in">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-lg font-bold text-risk-green">12s</span>
                  <p className="text-[10px] text-gray-400">Total time</p>
                </div>
                <div className="h-6 w-px bg-navy-mid" />
                <div className="text-center">
                  <span className="text-lg font-bold text-white">{ACTIONS.length}</span>
                  <p className="text-[10px] text-gray-400">Actions</p>
                </div>
                <div className="h-6 w-px bg-navy-mid" />
                <div className="text-center">
                  <span className="text-lg font-bold text-layer-agent">{incident.predictions.waste_avoided.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-400">Units saved</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Guardrail matrix + comparison */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Guardrail matrix */}
          <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <h3 className="text-xs font-semibold text-gray-300 mb-1">Guardrail Matrix</h3>
            <p className="text-[10px] text-gray-500 mb-2">Configured by Karin Chu's team</p>
            <div className="space-y-1.5">
              {[
                { action: 'Markdown', auto: 'Tier 3, ≤30%, ≤500u' },
                { action: 'DC re-routing', auto: 'Tier 4, capacity OK' },
                { action: 'Order reduction', auto: 'Tier 3, ≤15%' },
                { action: 'Supplier alert', auto: 'Any tier 3–4' },
              ].map(g => (
                <div key={g.action} className="bg-navy/50 rounded-lg p-2">
                  <span className="text-[10px] text-white font-semibold">{g.action}</span>
                  <p className="text-[10px] text-risk-green">Auto: {g.auto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Before/after comparison */}
          <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Impact Comparison</h3>
            <div className="space-y-2">
              <div className="bg-risk-red/5 border border-risk-red/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-risk-red" />
                  <span className="text-[10px] text-risk-red font-semibold">WITHOUT AI</span>
                </div>
                <p className="text-xs text-white font-bold">Thursday 15:00</p>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className="text-gray-400">Waste</span>
                  <span className="text-risk-red font-bold">2,950 units</span>
                </div>
              </div>
              <div className="bg-risk-green/5 border border-risk-green/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
                  <span className="text-[10px] text-risk-green font-semibold">WITH AI</span>
                </div>
                <p className="text-xs text-white font-bold">Wednesday 07:39</p>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className="text-gray-400">Saved</span>
                  <span className="text-risk-green font-bold">2,800 units</span>
                </div>
              </div>
              {showSummary && (
                <div className="text-center animate-slide-in">
                  <span className="text-[10px] text-gray-500">Time saved</span>
                  <p className="text-xl font-bold text-cap-cyan">31+ hours</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
