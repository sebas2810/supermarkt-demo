import { useState, useEffect } from 'react'
import data from '../data/digital_twin_workflow.json'

const { overview } = data

export default function DT1_Overview({ onAction }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const flowSteps = [
    { label: 'Real World',      sub: 'Stores & DCs',       color: '#1DB8F2', bg: 'rgba(29,184,242,0.12)' },
    { label: 'IoT Sensors',     sub: 'Temperature · GPS',  color: '#00828E', bg: 'rgba(0,130,142,0.12)' },
    { label: 'Digital Twin',    sub: 'Simulation Model',    color: '#00D5D0', bg: 'rgba(0,213,208,0.15)' },
    { label: 'Predict',         sub: 'Monte Carlo (×500)',  color: '#00D5D0', bg: 'rgba(0,213,208,0.10)' },
    { label: 'Act',             sub: 'Automated Response',  color: '#1DB8F2', bg: 'rgba(29,184,242,0.12)' },
  ]

  const metrics = [
    {
      value: overview.total_interventions.toLocaleString(),
      unit: 'interventions',
      label: 'Training the model',
      color: 'text-cap-cyan',
    },
    {
      value: `${Math.round(overview.avg_confidence * 100)}%`,
      unit: 'confidence',
      label: 'Average prediction accuracy',
      color: 'text-risk-green',
    },
    {
      value: overview.simulations_per_intervention.toLocaleString(),
      unit: 'simulations',
      label: 'Per intervention (Monte Carlo)',
      color: 'text-cap-cyan',
    },
  ]

  return (
    <div className="h-full p-4 flex flex-col gap-3">

      {/* ── Section 1: Feedback Loop Diagram ── */}
      <div
        className={`flex-none bg-navy-light rounded-xl border border-navy-mid p-4 transition-all duration-700 ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <h3 className="text-xs font-semibold text-gray-300 mb-1">
          Digital Twin — Closed-Loop Learning
        </h3>
        <p className="text-[10px] text-gray-500 mb-3">
          Every intervention feeds back into the model, continuously improving predictions
        </p>

        {/* Flow diagram */}
        <div className="flex items-center justify-between gap-1">
          {flowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1 flex-1 min-w-0">
              {/* Step box */}
              <div
                className="flex-1 rounded-lg border px-2 py-2 text-center min-w-0"
                style={{
                  borderColor: step.color + '40',
                  background: step.bg,
                }}
              >
                <p className="text-[10px] font-bold truncate" style={{ color: step.color }}>
                  {step.label}
                </p>
                <p className="text-[9px] text-gray-500 truncate">{step.sub}</p>
              </div>

              {/* Arrow (not after last) */}
              {i < flowSteps.length - 1 && (
                <svg width="18" height="12" viewBox="0 0 18 12" className="flex-none">
                  <path
                    d="M0 6 L12 6 M9 2 L14 6 L9 10"
                    stroke={step.color}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Return arrow label */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cap-cyan/30 to-transparent" />
          <span className="text-[9px] text-cap-cyan/60 tracking-wide uppercase">
            feedback loop
          </span>
          <svg width="14" height="10" viewBox="0 0 14 10" className="opacity-40">
            <path d="M14 5 L2 5 M5 1 L0 5 L5 9" stroke="#1DB8F2" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cap-cyan/30 to-transparent" />
        </div>
      </div>

      {/* ── Section 2: Metric Cards ── */}
      <div
        className={`flex-none grid grid-cols-3 gap-3 transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-navy-light rounded-xl border border-navy-mid p-3 text-center"
          >
            <p className={`text-lg font-bold ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[10px] text-gray-300 font-medium">{m.unit}</p>
            <p className="text-[9px] text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Section 3: Explainer Card ── */}
      <div
        className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col justify-between transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div>
          <h3 className="text-xs font-semibold text-gray-300 mb-2">How It Works</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            The Digital Twin has processed{' '}
            <span className="text-white font-semibold">
              {overview.simulations_per_intervention.toLocaleString()} Monte Carlo simulations
            </span>{' '}
            per intervention across{' '}
            <span className="text-white font-semibold">
              {overview.total_interventions.toLocaleString()} incidents
            </span>
            . Each outcome feeds back into the model, continuously improving accuracy
            &mdash; MAPE reduced from{' '}
            <span className="text-risk-green font-semibold">18.2% to 8.4%</span> over{' '}
            <span className="text-white font-semibold">{overview.weeks_active} weeks</span>.
          </p>
        </div>

        {/* Mini MAPE sparkline hint */}
        <div className="mt-2 flex items-center gap-2 text-[9px] text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-risk-green animate-pulse" />
          <span>Model accuracy improving week-over-week</span>
        </div>
      </div>

      {/* ── Section 4: CTA Button ── */}
      <div
        className={`flex-none transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <button
          onClick={() => onAction?.('exploreBurlington')}
          className="w-full py-2.5 rounded-xl bg-cap-cyan/20 border border-cap-cyan/40 text-cap-cyan text-sm font-semibold
                     hover:bg-cap-cyan/30 hover:border-cap-cyan/60 transition-all duration-300 cursor-pointer"
        >
          Explore Burlington NC &rarr;
        </button>
      </div>
    </div>
  )
}
