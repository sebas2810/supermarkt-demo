import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, BarChart, Bar
} from 'recharts'
import incident from '../data/synthetic_incident.json'

const TEMP_DATA = incident.cold_chain.temperature_readings.map(r => ({
  time: r.time,
  temp: r.temp,
  threshold: 4.0,
}))

const SELL_THROUGH = incident.sell_through.daily_data.filter(d => d.actual !== null)

function LiveClock() {
  const [blinkOn, setBlinkOn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setBlinkOn(b => !b), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full bg-risk-red ${blinkOn ? 'opacity-100' : 'opacity-30'}`} />
      <span className="font-mono text-xl text-white font-bold tracking-wider">07:30:00</span>
      <span className="text-xs text-gray-400">CET · Wednesday 12 March 2025</span>
    </div>
  )
}

function TempTooltip({ active, payload }) {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="bg-navy-light border border-navy-mid rounded px-3 py-2 text-xs">
        <p className="text-gray-400">{d.time}</p>
        <p className={`font-bold ${d.temp > 4.0 ? 'text-risk-red' : 'text-risk-green'}`}>
          {d.temp}°C
        </p>
      </div>
    )
  }
  return null
}

export default function IncidentTrigger() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`h-full p-4 flex flex-col gap-3 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Top: clock + alert */}
      <div className="flex-none flex items-center justify-between">
        <LiveClock />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-risk-red/10 border border-risk-red/30 rounded-lg glow-red">
          <span className="text-risk-red text-xs font-semibold">COLD CHAIN ALERT</span>
          <span className="text-xs text-gray-400">Ref: {incident.incident_id}</span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Temperature chart — 2 cols */}
        <div className="col-span-2 bg-navy-light rounded-xl border border-navy-mid p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-none flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-300">Cold Chain Temperature — Overnight Transit</h3>
            <span className="text-xs text-gray-500">{incident.supplier} → {incident.dc}</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMP_DATA} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} interval={1} />
                <YAxis
                  domain={[2, 8]}
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={v => `${v}°C`}
                  width={35}
                />
                <Tooltip content={<TempTooltip />} />
                <ReferenceLine y={4.0} stroke="#FF816E" strokeDasharray="6 3" label={{ value: '4.0°C Threshold', fill: '#FF816E', fontSize: 9, position: 'right' }} />
                <ReferenceArea x1="01:00" x2="05:30" fill="#FF816E" fillOpacity={0.08} />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#1DB8F2"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#1DB8F2' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-none flex items-center gap-4 mt-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-risk-red opacity-50" />
              <span className="text-gray-500">Threshold</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-risk-red/10 rounded" />
              <span className="text-gray-500">Exceedance: {incident.cold_chain.exceedance_duration_hours}h</span>
            </div>
            <span className="text-risk-red font-semibold">
              Peak: {incident.cold_chain.peak_temp_c}°C (+{incident.cold_chain.exceedance_degrees_c}°C)
            </span>
          </div>
        </div>

        {/* Right column — Incident summary + stores */}
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Incident card */}
          <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Incident Summary</h3>
            <div className="space-y-1.5 text-xs">
              {[
                ['SKU', incident.sku, 'font-mono'],
                ['Product', incident.description],
                ['Supplier', incident.supplier],
                ['DC', incident.dc],
                ['Units at Risk', incident.at_risk_units.toLocaleString(), 'text-risk-amber font-bold'],
                ['Shelf Life', `−${incident.shelf_life.reduction_hours}h`, 'text-risk-red font-bold'],
              ].map(([label, value, cls = 'text-white']) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected stores */}
          <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Affected Stores</h3>
            <div className="space-y-1.5">
              {incident.stores_affected.map(store => (
                <div key={store.id} className="flex items-center justify-between bg-navy/50 rounded-lg px-2 py-1.5">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono">{store.id}</span>
                    <p className="text-xs text-white">{store.name}</p>
                  </div>
                  <span className="text-xs text-risk-amber font-bold">{store.units.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sell-through bar chart */}
      <div className="flex-none h-28 bg-navy-light rounded-xl border border-navy-mid p-3 flex">
        <div className="w-44 flex-none">
          <h3 className="text-xs font-semibold text-gray-300 mb-1">Sell-Through vs RELEX Forecast</h3>
          <p className="text-[10px] text-gray-500 mb-1">3-day pattern — competitor promo</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-risk-amber">−23%</span>
            <span className="text-[10px] text-gray-400">vs forecast</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SELL_THROUGH} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} width={30} />
              <Tooltip
                contentStyle={{ background: '#121A38', border: '1px solid #1E2642', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar dataKey="forecast" fill="#0058AB" radius={[2, 2, 0, 0]} name="Forecast" />
              <Bar dataKey="actual" fill="#1DB8F2" radius={[2, 2, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
