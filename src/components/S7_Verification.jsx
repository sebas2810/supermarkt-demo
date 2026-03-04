import { useState, useEffect } from 'react'
import AnimatedNumber from './shared/AnimatedNumber'

export default function S7_Verification({ workflowState, onAction }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Outcome & Results — Intervention Complete</h3>
          <p className="text-[10px] text-gray-500">SC-2025-4421-BKT · Seeded Sourdough 400g · 3 stores</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
          <span className="text-[10px] text-risk-green font-semibold">RESOLVED</span>
        </div>
      </div>

      {/* Top row: 3 large metric cards */}
      <div className={`flex-none grid grid-cols-3 gap-3 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-navy-light rounded-xl border border-risk-green/30 p-4 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Units Saved</span>
          <p className="text-3xl font-bold text-risk-green mt-1">
            {phase >= 1 && <AnimatedNumber value={2800} decimals={0} />}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">of 3,400 at risk (82%)</p>
        </div>
        <div className="bg-navy-light rounded-xl border border-cap-cyan/30 p-4 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue Recovered</span>
          <p className="text-3xl font-bold text-cap-cyan mt-1">
            {'\u20AC'}{phase >= 1 && <AnimatedNumber value={4172} decimals={0} />}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">Net margin: {'\u20AC'}3,932</p>
        </div>
        <div className="bg-navy-light rounded-xl border border-cap-blue/30 p-4 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Detection → Action</span>
          <p className="text-3xl font-bold text-white mt-1">
            {phase >= 1 && <AnimatedNumber value={84} decimals={0} />}<span className="text-lg ml-0.5">min</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">06:15 detection → 07:39 executed</p>
        </div>
      </div>

      {/* Middle: Before/After comparison */}
      <div className={`flex-1 min-h-0 grid grid-cols-2 gap-3 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* WITHOUT AI */}
        <div className="bg-navy-light rounded-xl border border-risk-red/30 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-risk-red/20 flex items-center justify-center text-risk-red text-xs">{'\u2717'}</div>
            <h3 className="text-sm font-semibold text-risk-red">Without AI</h3>
            <span className="text-[9px] text-gray-500 ml-auto">Traditional Process</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="bg-navy/50 rounded-lg p-3">
              <span className="text-[9px] text-gray-500 uppercase">Detection</span>
              <p className="text-sm font-bold text-white">Thursday 15:00</p>
              <p className="text-[10px] text-gray-400">Manual inspection discovers expired stock</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3">
              <span className="text-[9px] text-gray-500 uppercase">Waste</span>
              <p className="text-sm font-bold text-risk-red">2,950 units</p>
              <p className="text-[10px] text-gray-400">87% of at-risk inventory lost</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3">
              <span className="text-[9px] text-gray-500 uppercase">Revenue Lost</span>
              <p className="text-sm font-bold text-risk-red">{'\u20AC'}6,755</p>
              <p className="text-[10px] text-gray-400">Full write-off at close of business</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3">
              <span className="text-[9px] text-gray-500 uppercase">Response Time</span>
              <p className="text-sm font-bold text-risk-amber">{'\u223C'}33 hours</p>
              <p className="text-[10px] text-gray-400">Alert to disposal</p>
            </div>
          </div>
        </div>

        {/* WITH AI */}
        <div className="bg-navy-light rounded-xl border border-risk-green/30 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-risk-green/20 flex items-center justify-center text-risk-green text-xs">{'\u2713'}</div>
            <h3 className="text-sm font-semibold text-risk-green">With RAISE 2.0</h3>
            <span className="text-[9px] text-gray-500 ml-auto">Agentic AI Process</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="bg-navy/50 rounded-lg p-3 border border-risk-green/10">
              <span className="text-[9px] text-gray-500 uppercase">Detection</span>
              <p className="text-sm font-bold text-white">Wednesday 06:15</p>
              <p className="text-[10px] text-risk-green">Automated IoT + ML detection</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3 border border-risk-green/10">
              <span className="text-[9px] text-gray-500 uppercase">Units Saved</span>
              <p className="text-sm font-bold text-risk-green">2,800 units</p>
              <p className="text-[10px] text-risk-green">82% of at-risk inventory rescued</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3 border border-risk-green/10">
              <span className="text-[9px] text-gray-500 uppercase">Revenue Recovered</span>
              <p className="text-sm font-bold text-risk-green">{'\u20AC'}4,172</p>
              <p className="text-[10px] text-risk-green">Markdown to {'\u20AC'}1.49 across 3 stores</p>
            </div>
            <div className="bg-navy/50 rounded-lg p-3 border border-risk-green/10">
              <span className="text-[9px] text-gray-500 uppercase">Response Time</span>
              <p className="text-sm font-bold text-risk-green">84 minutes</p>
              <p className="text-[10px] text-risk-green">Alert → POS update → ESL labels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Simulation accuracy + CTA */}
      <div className={`flex-none transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-navy-light rounded-xl border border-cap-cyan/20 p-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-risk-green/10 border border-risk-green/30 flex items-center justify-center">
                <span className="text-risk-green text-sm font-bold">94%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Simulation Accuracy</p>
                <p className="text-[9px] text-gray-500">Digital Twin predicted 2,650 (P50) · Actual: 2,800</p>
              </div>
            </div>
            <div className="h-6 w-px bg-navy-mid" />
            <div>
              <p className="text-xs font-semibold text-white">847 interventions</p>
              <p className="text-[9px] text-gray-500">Training the model · 91% avg confidence</p>
            </div>
            <div className="h-6 w-px bg-navy-mid" />
            <div>
              <p className="text-xs font-semibold text-white">MAPE: 8.4%</p>
              <p className="text-[9px] text-gray-500">Down from 18.2% in Week 1</p>
            </div>
          </div>
          {phase >= 4 && (
            <button
              onClick={() => onAction?.('backToDashboard')}
              className="flex-none px-5 py-2.5 bg-cap-cyan text-navy font-semibold text-xs rounded-lg hover:bg-cap-cyan/80 transition-colors animate-slide-in"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
