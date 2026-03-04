import { useState, useEffect } from 'react'
import dtData from '../data/digital_twin_workflow.json'
import AnimatedNumber from './shared/AnimatedNumber'

const scale = dtData.scale_impact

const kpiCards = [
  {
    label: 'Fresh Waste',
    before: `${scale.kpis_before.waste_pct}%`,
    afterVal: scale.kpis_after.waste_pct,
    afterSuffix: '%',
    decimals: 1,
    badge: '-35%',
    badgeColor: 'text-[#00D5D0] bg-[#00D5D0]/10',
  },
  {
    label: 'On-Shelf Availability',
    before: `${scale.kpis_before.availability}%`,
    afterVal: scale.kpis_after.availability,
    afterSuffix: '%',
    decimals: 1,
    badge: '+2.9pp',
    badgeColor: 'text-[#00D5D0] bg-[#00D5D0]/10',
  },
  {
    label: 'Detection Time',
    before: `${scale.kpis_before.detection_time_hours}h`,
    afterVal: scale.kpis_after.detection_time_hours,
    afterSuffix: 'h',
    decimals: 1,
    badge: '-96%',
    badgeColor: 'text-[#00D5D0] bg-[#00D5D0]/10',
  },
  {
    label: 'Weekly Interventions',
    before: `${scale.kpis_before.interventions_per_week}`,
    afterVal: scale.kpis_after.interventions_per_week,
    afterSuffix: '',
    decimals: 0,
    badge: 'autonomous',
    badgeColor: 'text-[#1DB8F2] bg-[#1DB8F2]/10',
  },
]

const statusStyles = {
  Live:      { dot: 'bg-[#00D5D0]', text: 'text-[#00D5D0]', bg: 'bg-[#00D5D0]/10' },
  Deploying: { dot: 'bg-[#FEB100]', text: 'text-[#FEB100]', bg: 'bg-[#FEB100]/10' },
  Planning:  { dot: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10' },
}

const brandAccents = {
  AH: 'border-[#00529B] bg-[#00529B]/20 text-[#1DB8F2]',
  FL: 'border-[#00828E] bg-[#00828E]/20 text-[#00D5D0]',
  DL: 'border-[#0058AB] bg-[#0058AB]/20 text-[#1DB8F2]',
  HF: 'border-[#00828E] bg-[#00828E]/20 text-[#00D5D0]',
  SS: 'border-[#0058AB] bg-[#0058AB]/20 text-[#1DB8F2]',
}

export default function DT5_ValueAtScale({ onAction }) {
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

      {/* ── Header ── */}
      <div
        className={`transition-all duration-700 ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <h2 className="text-sm font-semibold text-white tracking-wide">
          From One Incident to Group-Wide Impact
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
          <span className="text-[#1DB8F2] font-mono">SC-2025-4421-BKT</span>
          {' → '}
          <span className="text-[#00D5D0]">2,800 units saved</span>, <span className="text-[#00D5D0]">€4,172 recovered</span>
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Now scale this across <span className="text-slate-300">16 brands</span> and{' '}
          <span className="text-slate-300">7,000+ stores</span>
        </p>
      </div>

      {/* ── KPI Before → After ── */}
      <div
        className={`grid grid-cols-4 gap-2 transition-all duration-700 ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-[#1E2642] bg-[#121A38] p-3 flex flex-col gap-1.5"
          >
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">
              {k.label}
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-500 line-through">{k.before}</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {phase >= 1
                  ? <><AnimatedNumber value={k.afterVal} decimals={k.decimals} />{k.afterSuffix}</>
                  : '—'}
              </span>
            </div>

            <span
              className={`inline-flex self-start rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${k.badgeColor}`}
            >
              {k.badge}
            </span>
          </div>
        ))}
      </div>

      {/* ── Brand Cards ── */}
      <div
        className={`flex flex-wrap gap-2 transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {scale.brands.map((b, i) => {
          const s = statusStyles[b.status]
          return (
            <div
              key={b.code}
              className="rounded-xl border border-[#1E2642] bg-[#121A38] p-3 flex flex-col gap-2 min-w-[140px] flex-1"
              style={{
                transitionDelay: `${i * 120}ms`,
                opacity: phase >= 2 ? 1 : 0,
                transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 500ms, transform 500ms',
              }}
            >
              {/* Brand header */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${brandAccents[b.code]}`}
                >
                  {b.code}
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-white leading-tight">{b.name}</span>
                  <span className="text-[9px] text-slate-500">{b.country}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className={`inline-flex self-start items-center gap-1 rounded-full px-2 py-0.5 ${s.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <span className={`text-[9px] font-semibold ${s.text}`}>{b.status}</span>
              </div>

              {/* Metrics or placeholder */}
              {b.status === 'Live' && (
                <div className="flex gap-3 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Waste ↓</span>
                    <span className="text-xs font-bold text-[#00D5D0]">{b.waste_reduction}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Interventions</span>
                    <span className="text-xs font-bold text-white">{b.interventions}</span>
                  </div>
                </div>
              )}
              {b.status === 'Deploying' && (
                <div className="flex gap-3 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Waste ↓</span>
                    <span className="text-xs font-bold text-[#FEB100]">{b.waste_reduction}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Status</span>
                    <span className="text-[10px] text-[#FEB100]">deploying</span>
                  </div>
                </div>
              )}
              {b.status === 'Planning' && (
                <div className="mt-auto">
                  <span className="text-[10px] text-slate-500 italic">Scheduled</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Annual Value Projection ── */}
      <div
        className={`rounded-xl border border-[#1E2642] bg-[#121A38] p-4 text-center transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <p className="text-2xl font-extrabold text-white tracking-tight">
          €220–340M
        </p>
        <p className="text-[11px] text-slate-300 mt-1 font-medium">
          Projected annual value across Ahold Delhaize Group
        </p>
        <p className="text-[9px] text-slate-500 mt-0.5">
          Based on 847 interventions scaled to 7,000+ stores, 16 brands
        </p>
      </div>

      {/* ── CTA ── */}
      <div
        className={`flex justify-center mt-auto transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <button
          onClick={() => onAction?.('complete')}
          className="px-6 py-2 rounded-lg bg-[#00D5D0] hover:bg-[#00D5D0]/90 text-[#0A0E1F] text-xs font-bold tracking-wide transition-colors"
        >
          Complete
        </button>
      </div>
    </div>
  )
}
