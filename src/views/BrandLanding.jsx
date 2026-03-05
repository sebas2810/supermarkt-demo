import { Activity, Bot, Clock, Package } from 'lucide-react'
import brands from '../data/brands.json'
import useCases from '../data/use_cases.json'
import StatusBadge from '../components/shared/StatusBadge'
import BrandLogo from '../components/shared/BrandLogo'
import Sparkline from '../components/shared/Sparkline'

function MetricCard({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="bg-navy-light rounded-xl border border-navy-mid p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        <span className="text-[10px] text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  )
}

export default function BrandLanding({ brandId, navigateTo }) {
  const brand = brands.find(b => b.id === brandId)

  if (!brand) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Brand not found</p>
      </div>
    )
  }

  const hasDeployments = brand.deployedUseCases.length > 0

  return (
    <div className="h-full overflow-auto p-5">
      {/* Brand header */}
      <div className="flex items-center gap-4 mb-5">
        <BrandLogo brand={brand} size="lg" />
        <div>
          <h2 className="text-xl font-semibold text-white">{brand.name}</h2>
          <p className="text-xs text-gray-400">{brand.region} · {brand.stores.toLocaleString()} stores</p>
        </div>
      </div>

      {/* Health strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard icon={Activity} label="Active Apps" value={brand.summary.activeApps} iconColor="#1DB8F2" />
        <MetricCard icon={Bot} label="Agents Running" value={brand.summary.agentsRunning} iconColor="#00D5D0" />
        <MetricCard icon={Clock} label="Last Intervention" value={brand.summary.lastIntervention} iconColor="#FEB100" />
        <MetricCard icon={Package} label="Weekly Waste Saved" value={brand.summary.weeklyWasteSaved} iconColor="#FF816E" />
      </div>

      {/* Orchestration grid */}
      {hasDeployments ? (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Deployed Use Cases</h3>
          <div className="grid grid-cols-3 gap-3">
            {brand.deployedUseCases.map(duc => {
              const ucDef = useCases.find(u => u.id === duc.useCaseId)
              if (!ucDef) return null

              const isHealthy = duc.status === 'healthy'
              const isDegraded = duc.status === 'degraded'
              const isAlert = duc.status === 'alert'

              const borderClass = isHealthy
                ? 'border-risk-green/30'
                : isDegraded
                ? 'border-risk-amber/30 animate-pulse-border-amber'
                : 'border-risk-red/30 animate-pulse-border-red'

              const kpiMeetsTarget = duc.kpi.value >= duc.kpi.target
              const sparkColor = isHealthy ? '#00D5D0' : isDegraded ? '#FEB100' : '#FF816E'

              return (
                <div
                  key={duc.useCaseId}
                  onClick={() => {
                    if (duc.useCaseId === 'uc-fresh-waste') {
                      navigateTo('workflow', { label: 'Workflow Demo' })
                    } else {
                      navigateTo('flow', { useCaseId: duc.useCaseId, label: `${ucDef.name} — Flow` })
                    }
                  }}
                  className={`bg-navy-light rounded-xl border ${borderClass} p-4 cursor-pointer hover:bg-navy-mid/30 transition-all`}
                >
                  {/* Name + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-white">{ucDef.name}</h4>
                    <StatusBadge status={duc.status} />
                  </div>

                  {/* KPI */}
                  <div className="bg-navy/50 rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{duc.kpi.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${kpiMeetsTarget ? 'text-risk-green' : 'text-risk-amber'}`}>
                          {duc.kpi.value}{duc.kpi.unit}
                        </span>
                        <span className="text-[9px] text-gray-500">/ {duc.kpi.target}{duc.kpi.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="mb-2">
                    <Sparkline data={duc.sparkline} color={sparkColor} width={200} height={28} />
                  </div>

                  {/* Last agent action */}
                  <p className="text-[9px] text-gray-500 truncate">{duc.lastAgentAction}</p>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="bg-navy-light rounded-xl border border-navy-mid p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-mid/50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-300 mb-1">No Use Cases Deployed</h3>
          <p className="text-xs text-gray-500 mb-4">
            {brand.name} has no active AI use cases yet. Browse the gallery to deploy.
          </p>
          <button
            onClick={() => navigateTo('gallery', { label: 'Use Cases' })}
            className="px-4 py-2 bg-cap-cyan/10 border border-cap-cyan/30 text-cap-cyan text-xs font-semibold rounded-lg hover:bg-cap-cyan/20 transition-all"
          >
            Browse Use Case Gallery
          </button>
        </div>
      )}
    </div>
  )
}
