import { useState, useEffect } from 'react'
import kpiData from '../data/kpi_data.json'
import scaleData from '../data/scale_engine.json'
import AnimatedNumber from './shared/AnimatedNumber'
import KPICard from './shared/KPICard'
import BrandCard from './shared/BrandCard'

export default function S8_ValueAtScale() {
  const [showProjection, setShowProjection] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowProjection(true), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-full p-4 flex flex-col gap-3">
      {/* KPI cards grid */}
      <div className="flex-none grid grid-cols-6 gap-2">
        {kpiData.kpis.map((kpi, i) => (
          <KPICard key={kpi.name} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Brand cards grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3 overflow-auto">
        {scaleData.map((brand, i) => (
          <BrandCard key={brand.brand} brand={brand} index={i} />
        ))}
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
              <span className="text-2xl font-bold text-white">{'\u20AC'}</span>
              <span className="text-3xl font-bold text-cap-cyan">
                {showProjection && <AnimatedNumber value={kpiData.group_projection.annual_value_low} decimals={0} />}
              </span>
              <span className="text-xl text-gray-400">{'\u2013'}</span>
              <span className="text-3xl font-bold text-cap-cyan">
                {showProjection && <AnimatedNumber value={kpiData.group_projection.annual_value_high} decimals={0} />}
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
