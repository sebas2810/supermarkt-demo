import { useState, useEffect, useRef } from 'react'
import incident from '../data/synthetic_incident.json'

const ACTIONS = incident.agent_actions

export default function S6_Execution({ workflowState, onAction }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count > ACTIONS.length) {
        clearInterval(interval)
        setTimeout(() => {
          setShowSummary(true)
        }, 500)
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
      {/* Approval stamp + execution header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
            <span className="text-[10px] text-risk-green font-semibold">Approved by K. Chu — 07:38 CET</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-navy-light rounded-lg border border-navy-mid">
            <div className={`w-2 h-2 rounded-full ${visibleCount < ACTIONS.length ? 'bg-cap-orange animate-pulse' : 'bg-risk-green'}`} />
            <span className="text-gray-400 text-[10px]">{visibleCount < ACTIONS.length ? 'Executing...' : 'Complete'}</span>
          </div>
          <span className="font-mono text-gray-500 text-[10px]">{visibleCount}/{ACTIONS.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Agent action log — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-none flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-300">Autonomous Execution Log</h3>
            <span className="text-[10px] text-gray-500 font-mono">Agentic Supply Chain · Audit Trail</span>
          </div>

          <div ref={logRef} className="flex-1 min-h-0 bg-[#0a0c14] rounded-lg p-3 font-mono text-[11px] overflow-auto border border-[#1a1e30]">
            {ACTIONS.slice(0, visibleCount).map((action, i) => {
              const isExecuting = action.status === 'executing'
              const isLatest = i === visibleCount - 1
              return (
                <div key={i} className={`flex items-start gap-2 py-1 ${isLatest ? 'animate-slide-in' : ''}`}>
                  <span className="text-gray-600 flex-none w-14">{action.time}</span>
                  <span className={`flex-none w-3 ${isExecuting ? 'text-cap-orange' : 'text-risk-green'}`}>
                    {isExecuting ? '\u2192' : '\u2713'}
                  </span>
                  <span className={`${isExecuting ? 'text-cap-orange' : 'text-gray-300'} ${isLatest ? 'text-white' : ''}`}>
                    {action.action}
                  </span>
                </div>
              )
            })}
            {visibleCount < ACTIONS.length && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-cap-orange animate-pulse">{'\u258A'}</span>
              </div>
            )}
          </div>

          {showSummary && (
            <div className="flex-none mt-2 bg-risk-green/5 border border-risk-green/20 rounded-lg p-2.5 animate-slide-in">
              <div className="flex items-center justify-between">
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
                    <span className="text-lg font-bold text-cap-cyan">{incident.predictions.waste_avoided.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-400">Units saved</p>
                  </div>
                </div>
                <button
                  onClick={() => onAction?.('executionComplete')}
                  className="flex-none px-5 py-2.5 bg-cap-cyan text-navy font-semibold text-xs rounded-lg hover:bg-cap-cyan/80 transition-colors"
                >
                  View Results {'\u2192'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Before/After */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          <div className="bg-risk-red/5 border border-risk-red/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-risk-red" />
              <span className="text-xs text-risk-red font-semibold">WITHOUT AI</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Detection</span>
                <span className="text-white">Thursday 15:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waste</span>
                <span className="text-risk-red font-bold">2,950 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue lost</span>
                <span className="text-risk-red font-bold">{'\u20AC'}6,755</span>
              </div>
            </div>
          </div>

          <div className="bg-risk-green/5 border border-risk-green/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
              <span className="text-xs text-risk-green font-semibold">WITH AI</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Detection</span>
                <span className="text-white">Wednesday 06:15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Action</span>
                <span className="text-white">Wednesday 07:39</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Saved</span>
                <span className="text-risk-green font-bold">2,800 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue recovered</span>
                <span className="text-risk-green font-bold">{'\u20AC'}4,172</span>
              </div>
            </div>
          </div>

          {showSummary && (
            <div className="bg-navy-light rounded-xl border border-cap-blue/30 p-3 text-center animate-slide-in">
              <span className="text-[10px] text-gray-500">Time saved vs manual process</span>
              <p className="text-2xl font-bold text-cap-cyan">31+ hours</p>
              <p className="text-[10px] text-gray-400 mt-1">Detected → Executed in 84 minutes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
