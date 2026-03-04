import { useState, useEffect } from 'react'
import incident from '../data/synthetic_incident.json'
import CheckLine from './shared/CheckLine'

const CHECKS = incident.classification.guardrail_checks

export default function S5_Governance({ workflowState, onAction }) {
  const [phase, setPhase] = useState(0)
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2800),
      setTimeout(() => setPhase(3), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleApprove = () => {
    setApproved(true)
    onAction?.('approvalGiven')
  }

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Governance & Approval — Human-in-the-Loop</h3>
          <p className="text-[10px] text-gray-500">Guardrail validation + threshold-based escalation</p>
        </div>
        {phase >= 3 && !approved && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-risk-amber/10 border border-risk-amber/30 rounded-lg animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-amber" />
            <span className="text-[10px] text-risk-amber font-semibold">APPROVAL REQUIRED</span>
          </div>
        )}
        {approved && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
            <span className="text-[10px] text-risk-green font-semibold">APPROVED</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Left: Guardrail checks */}
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-0.5">Automated Guardrail Checks</h3>
          <p className="flex-none text-[10px] text-gray-500 mb-2">Pre-action validation matrix</p>

          <div className="flex-1 min-h-0 space-y-1.5 overflow-auto">
            {CHECKS.map((check, i) => (
              <CheckLine key={check.check} check={check} delay={i * 450} visible={phase >= 1} />
            ))}
          </div>

          {/* All passed */}
          <div className={`flex-none mt-3 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-risk-green/5 border border-risk-green/30 rounded-lg p-2 text-center">
              <span className="text-[10px] text-risk-green font-semibold">{'\u2713'} All 4 guardrail checks passed</span>
            </div>
          </div>
        </div>

        {/* Right: Thresholds + Approval */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Escalation reason */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Escalation Trigger</h3>
            <div className="bg-risk-amber/5 border border-risk-amber/20 rounded-lg p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-risk-amber/20 flex items-center justify-center text-[10px] text-risk-amber">!</div>
                <span className="text-xs text-risk-amber font-semibold">Threshold Exceeded</span>
              </div>
              <p className="text-[10px] text-gray-300 leading-relaxed">
                Unit volume <span className="text-white font-bold">3,400</span> exceeds autonomous threshold of <span className="text-white font-bold">500 units</span>. Category Manager approval required per AH governance policy.
              </p>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                { rule: 'Discount \u2264 30%', value: '35%', status: 'Exceeded' },
                { rule: 'Units \u2264 500', value: '3,400', status: 'Exceeded' },
                { rule: 'Value \u2264 \u20AC1,000', value: '\u20AC7,786', status: 'Exceeded' },
              ].map(r => (
                <div key={r.rule} className="flex items-center justify-between text-[10px] bg-navy/50 rounded-lg px-2 py-1.5">
                  <span className="text-gray-400">{r.rule}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{r.value}</span>
                    <span className="text-risk-amber font-semibold">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval card */}
          <div className={`bg-navy-light rounded-xl border border-navy-mid p-3 transition-opacity duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Action Required</h3>
            <div className="bg-navy/50 rounded-lg p-2.5 mb-3">
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Action</span>
                  <span className="text-white font-semibold">Markdown {'\u20AC'}2.29 → {'\u20AC'}1.49</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scope</span>
                  <span className="text-white font-semibold">3,400 units · 3 stores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue impact</span>
                  <span className="text-risk-green font-semibold">{'\u20AC'}4,172 recovered</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deadline</span>
                  <span className="text-risk-amber font-semibold">Thursday 11:00</span>
                </div>
              </div>
            </div>

            {!approved ? (
              <div className="space-y-2">
                <button
                  onClick={handleApprove}
                  className="w-full py-2.5 bg-risk-green text-navy font-bold text-sm rounded-lg hover:bg-risk-green/80 transition-all animate-pulse"
                >
                  Approve Action
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-navy border border-navy-mid text-gray-400 text-[10px] rounded-lg cursor-not-allowed opacity-50">Modify</button>
                  <button className="flex-1 py-1.5 bg-navy border border-navy-mid text-gray-400 text-[10px] rounded-lg cursor-not-allowed opacity-50">Reject</button>
                  <button className="flex-1 py-1.5 bg-navy border border-navy-mid text-gray-400 text-[10px] rounded-lg cursor-not-allowed opacity-50">Escalate</button>
                </div>
              </div>
            ) : (
              <div className="bg-risk-green/10 border border-risk-green/30 rounded-lg p-3 text-center animate-slide-in">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-risk-green/20 flex items-center justify-center text-risk-green text-xs">{'\u2713'}</div>
                  <span className="text-sm font-bold text-risk-green">Approved</span>
                </div>
                <p className="text-[10px] text-gray-400">by K. Chu — 07:38 CET</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
