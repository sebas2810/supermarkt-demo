import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import kpiData from '../data/kpi_data.json'

function AnimatedCounter({ value, duration = 2000, decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}

function KPICard({ kpi, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300 + index * 120)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div className={`bg-navy-light rounded-xl border border-navy-mid p-2.5 transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <h4 className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider leading-tight" style={{ minHeight: '24px' }}>{kpi.name}</h4>
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <div className="bg-navy/50 rounded-lg p-1.5 text-center">
          <span className="text-[8px] text-gray-500 uppercase block">Before</span>
          <span className="text-sm font-bold text-gray-400">{kpi.before}</span>
        </div>
        <div className="bg-risk-green/5 border border-risk-green/20 rounded-lg p-1.5 text-center">
          <span className="text-[8px] text-gray-500 uppercase block">After</span>
          <span className="text-sm font-bold text-white">{kpi.after}</span>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-risk-green bg-risk-green/10">
          {kpi.change_label}
        </span>
      </div>
    </div>
  )
}

export default function KPIDashboard() {
  const [showProjection, setShowProjection] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowProjection(true), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h3 className="text-xs text-gray-400">Albert Heijn Proof of Value — 90-Day Production Results</h3>
          <p className="text-[10px] text-gray-500">KPI baseline agreed with governance office</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-risk-green/10 border border-risk-green/30 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
          <span className="text-[10px] text-risk-green font-semibold">90 Days Live</span>
        </div>
      </div>

      {/* KPI cards grid */}
      <div className="flex-none grid grid-cols-6 gap-2">
        {kpiData.kpis.map((kpi, i) => (
          <KPICard key={kpi.name} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Charts row — use explicit min-height */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-1">Fresh Waste % — 13-Week Trend</h3>
          <div className="flex-1 min-h-0" style={{ minHeight: '100px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiData.waste_trend} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 9 }} />
                <YAxis domain={[2.5, 4.5]} tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={v => `${v}%`} width={28} />
                <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, 'Waste %']} />
                <Line type="monotone" dataKey="waste_pct" stroke="#00D5D0" strokeWidth={2.5} dot={{ fill: '#00D5D0', r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <h3 className="flex-none text-xs font-semibold text-gray-300 mb-1">Before vs After — Key Metrics</h3>
          <div className="flex-1 min-h-0" style={{ minHeight: '100px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kpiData.kpis.filter(k => k.name !== 'CO₂ Saved').map(k => ({
                  name: k.name.length > 14 ? k.name.slice(0, 13) + '…' : k.name,
                  before: k.before,
                  after: k.after,
                }))}
                margin={{ top: 5, right: 10, bottom: 30, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 8 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#6B7280', fontSize: 9 }} width={28} />
                <Tooltip contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="before" fill="#0058AB" radius={[2, 2, 0, 0]} name="Before" />
                <Bar dataKey="after" fill="#00D5D0" radius={[2, 2, 0, 0]} name="After (90d)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Group scale projection */}
      <div className={`flex-none bg-gradient-to-r from-cap-blue/10 to-cap-cyan/10 border border-cap-blue/30 rounded-xl p-3 transition-all duration-1000 ${
        showProjection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cap-cyan uppercase tracking-wider font-semibold">Group Scale Projection</span>
            <p className="text-xs text-gray-300 mt-0.5">
              All {kpiData.group_projection.brands} brands — Save for Our Customers programme
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">€</span>
              <span className="text-3xl font-bold text-cap-cyan">
                {showProjection && <AnimatedCounter value={kpiData.group_projection.annual_value_low} decimals={0} />}
              </span>
              <span className="text-xl text-gray-400">–</span>
              <span className="text-3xl font-bold text-cap-cyan">
                {showProjection && <AnimatedCounter value={kpiData.group_projection.annual_value_high} decimals={0} />}
              </span>
              <span className="text-lg text-gray-400">M</span>
            </div>
            <p className="text-[10px] text-gray-400">Annual value</p>
          </div>
        </div>
      </div>
    </div>
  )
}
