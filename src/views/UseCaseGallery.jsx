import { useState } from 'react'
import useCases from '../data/use_cases.json'
import brands from '../data/brands.json'
import StatusBadge from '../components/shared/StatusBadge'
import LayerIndicator from '../components/shared/LayerIndicator'
import { ExecutionModelBadge } from './AgentFlowView'
import UseCaseDrawer from './UseCaseDrawer'

const DOMAINS = ['All', 'Fresh', 'Demand', 'Logistics', 'Commercial']

const DOMAIN_COLORS = {
  Fresh: '#00D5D0',
  Demand: '#1DB8F2',
  Logistics: '#FF816E',
  Commercial: '#FEB100',
}

export default function UseCaseGallery({ navigateTo }) {
  const [filter, setFilter] = useState('All')
  const [selectedUC, setSelectedUC] = useState(null)

  const filtered = filter === 'All' ? useCases : useCases.filter(uc => uc.domain === filter)

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main gallery */}
      <div className="flex-1 p-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-none">
            <h2 className="text-lg font-semibold text-white">Use Case Gallery</h2>
            <p className="text-xs text-gray-500">Supply chain AI applications across all domains</p>
          </div>
          <div className="flex items-center gap-1 flex-none">
            {DOMAINS.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  filter === d
                    ? 'bg-cap-cyan/15 text-cap-cyan border border-cap-cyan/30'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent hover:border-navy-mid'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3">
          {filtered.map((uc, i) => {
            const deployedBrands = uc.brands.map(b => brands.find(br => br.id === b.brandId)).filter(Boolean)
            return (
              <div
                key={uc.id}
                onClick={() => setSelectedUC(uc)}
                className="bg-navy-light rounded-xl border border-navy-mid p-4 cursor-pointer hover:border-gray-600 transition-all animate-fade-in group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Domain + Status */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: DOMAIN_COLORS[uc.domain],
                      backgroundColor: `${DOMAIN_COLORS[uc.domain]}15`,
                    }}
                  >
                    {uc.domain}
                  </span>
                  <StatusBadge status={uc.status} />
                </div>

                {/* Title + Description */}
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-cap-cyan transition-colors">{uc.name}</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{uc.description}</p>

                {/* AI Layers + Execution Model */}
                <div className="flex items-center justify-between mb-3">
                  <LayerIndicator layers={uc.aiLayers} showLabels />
                  {uc.executionModel && <ExecutionModelBadge model={uc.executionModel} />}
                </div>

                {/* Brand deployment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {deployedBrands.slice(0, 3).map(brand => (
                      <div
                        key={brand.id}
                        className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ backgroundColor: brand.logoColor }}
                        title={brand.name}
                      >
                        {brand.shortName}
                      </div>
                    ))}
                    {deployedBrands.length === 0 && (
                      <span className="text-[9px] text-gray-600">No deployments</span>
                    )}
                  </div>
                  {deployedBrands.length > 0 && (
                    <span className="text-[9px] text-gray-500">{deployedBrands.length} brand{deployedBrands.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Drawer */}
      {selectedUC && (
        <UseCaseDrawer
          useCase={selectedUC}
          onClose={() => setSelectedUC(null)}
          navigateTo={navigateTo}
        />
      )}
    </div>
  )
}
