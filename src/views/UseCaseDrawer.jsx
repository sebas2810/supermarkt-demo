import { X, Play, GitBranch, Rocket, Sparkles, Box } from 'lucide-react'
import brands from '../data/brands.json'
import StatusBadge from '../components/shared/StatusBadge'
import LayerIndicator from '../components/shared/LayerIndicator'
import { ExecutionModelBadge } from './AgentFlowView'
import { useState } from 'react'

export default function UseCaseDrawer({ useCase, onClose, navigateTo }) {
  const [deployed, setDeployed] = useState(false)

  const deployedBrands = useCase.brands
    .map(b => {
      const brand = brands.find(br => br.id === b.brandId)
      return brand ? { ...brand, deployStatus: b.status } : null
    })
    .filter(Boolean)

  const availableBrands = brands.filter(b => !useCase.brands.find(ub => ub.brandId === b.id))

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-navy-light border-l border-navy-mid z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-navy-mid">
          <div>
            <h3 className="text-sm font-semibold text-white">{useCase.name}</h3>
            <p className="text-[10px] text-gray-500">{useCase.domain} Domain</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy-mid transition-colors text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Status + Layers */}
          <div className="flex items-center justify-between">
            {useCase.hasWorkflow ? (
              <StatusBadge status={useCase.status} />
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <span className="text-[10px] font-semibold text-gray-500">Coming Soon</span>
              </span>
            )}
            <LayerIndicator layers={useCase.aiLayers} showLabels />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-1">Description</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{useCase.description}</p>
          </div>

          {/* Execution Model */}
          {useCase.executionModel && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-semibold text-gray-300">Execution Model</h4>
                <ExecutionModelBadge model={useCase.executionModel} />
              </div>
              <div className="space-y-1.5">
                {useCase.scriptedDescription && (
                  <div className="bg-cap-blue/5 border border-cap-blue/15 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <GitBranch className="w-3 h-3 text-cap-blue" />
                      <span className="text-[10px] text-cap-blue font-semibold">Scripted — LangGraph</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{useCase.scriptedDescription}</p>
                  </div>
                )}
                {useCase.unscriptedDescription && (
                  <div className="bg-cap-turquoise/5 border border-cap-turquoise/15 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3 text-cap-turquoise" />
                      <span className="text-[10px] text-cap-turquoise font-semibold">Unscripted — GenAI</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{useCase.unscriptedDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KPIs */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Key Performance Indicators</h4>
            <div className="space-y-1.5">
              {useCase.kpis.map(kpi => (
                <div key={kpi.name} className="flex items-center justify-between bg-navy/50 rounded-lg px-3 py-2">
                  <span className="text-[11px] text-gray-400">{kpi.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-bold">{kpi.value}</span>
                    <span className="text-[9px] text-gray-500">target: {kpi.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployed Brands */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Brand Deployments</h4>
            {deployedBrands.length > 0 ? (
              <div className="space-y-1.5">
                {deployedBrands.map(brand => (
                  <div key={brand.id} className="flex items-center justify-between bg-navy/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: brand.logoColor }}
                      >
                        {brand.shortName}
                      </div>
                      <div>
                        <span className="text-xs text-white">{brand.name}</span>
                        <span className="text-[9px] text-gray-500 ml-2">{brand.region}</span>
                      </div>
                    </div>
                    <StatusBadge status={brand.deployStatus} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-navy/50 rounded-lg px-3 py-3 text-center">
                <p className="text-[11px] text-gray-500">No brands deployed yet</p>
              </div>
            )}
          </div>

          {/* Available for deployment */}
          {availableBrands.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2">Available for Deployment</h4>
              <div className="flex flex-wrap gap-1.5">
                {availableBrands.map(brand => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-1.5 bg-navy/50 rounded-lg px-2.5 py-1.5 border border-navy-mid"
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: brand.logoColor }}
                    >
                      {brand.shortName}
                    </div>
                    <span className="text-[10px] text-gray-400">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-none p-4 border-t border-navy-mid space-y-2">
          {useCase.hasWorkflow ? (
            <>
              <button
                onClick={() => {
                  onClose()
                  navigateTo('workflow', { label: 'Workflow Demo' })
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cap-cyan text-navy font-semibold text-xs rounded-lg hover:bg-cap-cyan/80 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Open Workflow Demo
              </button>
              <button
                onClick={() => {
                  onClose()
                  navigateTo('workflow-dt', { label: 'Digital Twin Demo' })
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cap-teal text-white font-semibold text-xs rounded-lg hover:bg-cap-teal/80 transition-all"
              >
                <Box className="w-3.5 h-3.5" />
                Open Digital Twin Demo
              </button>
            </>
          ) : (
            <div className="bg-navy/60 border border-navy-mid rounded-lg p-3 text-center">
              <p className="text-[11px] text-gray-500 font-medium">Interactive demo not yet available</p>
              <p className="text-[9px] text-gray-600 mt-0.5">This use case is on the roadmap</p>
            </div>
          )}
          <button
            onClick={() => {
              onClose()
              navigateTo('flow', { useCaseId: useCase.id, label: `${useCase.name} — Flow` })
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy border border-cap-cyan/30 text-cap-cyan font-semibold text-xs rounded-lg hover:bg-cap-cyan/10 transition-all"
          >
            <GitBranch className="w-3.5 h-3.5" />
            View Agent Flow
          </button>
          {!deployed ? (
            <button
              onClick={() => setDeployed(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-navy border border-navy-mid text-gray-400 text-xs rounded-lg hover:border-risk-green/30 hover:text-risk-green transition-all"
            >
              <Rocket className="w-3.5 h-3.5" />
              Deploy to Brand
            </button>
          ) : (
            <div className="bg-risk-green/10 border border-risk-green/30 rounded-lg p-2.5 text-center animate-slide-in">
              <span className="text-[11px] text-risk-green font-semibold">{'\u2713'} Deployment initiated</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
