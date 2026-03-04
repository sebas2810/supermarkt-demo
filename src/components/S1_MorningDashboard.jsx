import { useState, useEffect } from 'react'

const QUEUE_ITEMS = [
  { id: 'SC-2025-4418', title: 'Dairy shelf-life refresh — DC Zaandam', status: 'resolved', time: '06:12' },
  { id: 'SC-2025-4419', title: 'Produce re-order — AH Eindhoven Centrum', status: 'resolved', time: '06:45' },
]

export default function S1_MorningDashboard({ onAction }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Profile + Stats Row */}
      <div className="flex-none flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-cap-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">KC</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Good morning, Karin</h3>
            <p className="text-[10px] text-gray-500">Category Manager Fresh · Albert Heijn</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {[
            { label: 'Stores', value: '1,063' },
            { label: 'DCs', value: '5' },
            { label: 'SKUs Fresh', value: '2,847' },
          ].map(s => (
            <div key={s.label} className="text-center px-3 py-1 bg-navy-light rounded-lg border border-navy-mid">
              <span className="text-sm font-bold text-white">{s.value}</span>
              <p className="text-[8px] text-gray-500 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI summary cards */}
      <div className={`flex-none grid grid-cols-4 gap-3 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {[
          { label: 'Fresh Waste', value: '3.1%', change: '\u221226% vs baseline', color: 'text-risk-green' },
          { label: 'On-Shelf Availability', value: '97.1%', change: '+2.8pp', color: 'text-risk-green' },
          { label: 'Interventions Today', value: '12', change: '3 pending review', color: 'text-cap-cyan' },
          { label: 'Open Alerts', value: '2', change: '1 high priority', color: 'text-risk-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{kpi.label}</span>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Today's Queue */}
      <div className={`flex-1 min-h-0 bg-navy-light rounded-xl border border-navy-mid p-4 flex flex-col transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex-none flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Today's Queue</h3>
          <span className="text-[10px] text-gray-500">Wednesday 12 March 2025 · 07:30 CET</span>
        </div>

        <div className="flex-1 min-h-0 space-y-2 overflow-auto">
          {QUEUE_ITEMS.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-navy/50 rounded-lg px-3 py-2.5">
              <div className="w-5 h-5 rounded-full bg-risk-green/20 flex items-center justify-center text-[10px] text-risk-green">{'\u2713'}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-300">{item.title}</p>
                <span className="text-[10px] text-gray-500">{item.id} · Auto-resolved {item.time}</span>
              </div>
              <span className="text-[10px] text-risk-green font-semibold px-2 py-0.5 bg-risk-green/10 rounded">Resolved</span>
            </div>
          ))}

          {/* Cold chain alert - fades in */}
          <div className={`transition-all duration-1000 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 bg-risk-red/5 border border-risk-red/30 rounded-lg px-3 py-2.5 glow-red">
              <div className="w-5 h-5 rounded-full bg-risk-red/20 flex items-center justify-center text-[10px] text-risk-red animate-pulse">!</div>
              <div className="flex-1">
                <p className="text-xs text-white font-semibold">Cold Chain Breach — Bakker Bart Zaandam → Amstel DC</p>
                <span className="text-[10px] text-gray-400">SC-2025-4421-BKT · 3,400 units at risk · Seeded Sourdough 400g</span>
              </div>
              <button
                onClick={() => onAction?.('investigate')}
                className="px-3 py-1 bg-cap-cyan text-navy font-semibold text-[10px] rounded-lg hover:bg-cap-cyan/80 transition-colors whitespace-nowrap"
              >
                Investigate →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
