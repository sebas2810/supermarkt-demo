import { useState, useCallback } from 'react'
import {
  LayoutDashboard, Grid3X3, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'
import brands from './data/brands.json'
import BrandLogo from './components/shared/BrandLogo'
import Breadcrumb from './components/shared/Breadcrumb'
import { WorkflowProvider } from './context/WorkflowContext'
import WorkflowView from './views/WorkflowView'
import UseCaseGallery from './views/UseCaseGallery'
import BrandLanding from './views/BrandLanding'
import AgentFlowView from './views/AgentFlowView'
import GenerativeKPIDashboard from './views/GenerativeKPIDashboard'

function CapgeminiLogo({ className = '' }) {
  return (
    <img
      src="https://cdn.brandfetch.io/capgemini.com"
      alt="Capgemini"
      className={`object-contain ${className}`}
    />
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'gallery', label: 'Use Cases', icon: Grid3X3 },
]

export default function PlatformShell() {
  const [view, setView] = useState('dashboard')
  const [selectedBrandId, setSelectedBrandId] = useState(null)
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [navStack, setNavStack] = useState([{ view: 'dashboard', label: 'Dashboard' }])

  const navigateTo = useCallback((newView, params = {}) => {
    const { brandId, useCaseId, label } = params
    if (brandId !== undefined) setSelectedBrandId(brandId)
    if (useCaseId !== undefined) setSelectedUseCaseId(useCaseId)
    setView(newView)

    const newLabel = label || {
      dashboard: 'Dashboard',
      gallery: 'Use Cases',
      brand: brands.find(b => b.id === (brandId || selectedBrandId))?.name || 'Brand',
      workflow: 'Workflow Demo',
      'workflow-dt': 'Digital Twin Demo',
      flow: 'Agent Flow',
    }[newView]

    setNavStack(prev => [...prev, { view: newView, brandId, useCaseId, label: newLabel }])
  }, [selectedBrandId])

  const navigateBack = useCallback((item) => {
    const idx = navStack.findIndex(n => n.view === item.view && n.label === item.label)
    if (idx >= 0) {
      const target = navStack[idx]
      setNavStack(navStack.slice(0, idx + 1))
      setView(target.view)
      if (target.brandId !== undefined) setSelectedBrandId(target.brandId)
      if (target.useCaseId !== undefined) setSelectedUseCaseId(target.useCaseId)
    }
  }, [navStack])

  const goHome = useCallback((viewId) => {
    setView(viewId)
    setNavStack([{ view: viewId, label: viewId === 'dashboard' ? 'Dashboard' : 'Use Cases' }])
  }, [])

  const breadcrumbItems = navStack.map(item => ({
    label: item.label,
    view: item.view,
  }))

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <GenerativeKPIDashboard navigateTo={navigateTo} />
      case 'gallery':
        return <UseCaseGallery navigateTo={navigateTo} />
      case 'brand':
        return <BrandLanding brandId={selectedBrandId} navigateTo={navigateTo} />
      case 'workflow':
        return <WorkflowView workflowId="intervention" onBack={() => navigateBack(navStack[navStack.length - 2] || navStack[0])} />
      case 'workflow-dt':
        return <WorkflowView workflowId="digital-twin" onBack={() => navigateBack(navStack[navStack.length - 2] || navStack[0])} />
      case 'flow':
        return <AgentFlowView useCaseId={selectedUseCaseId} navigateTo={navigateTo} />
      default:
        return <GenerativeKPIDashboard navigateTo={navigateTo} />
    }
  }

  return (
    <WorkflowProvider>
    <div className="w-screen h-screen bg-navy flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex-none flex flex-col bg-navy-light border-r border-navy-mid/50 sidebar-transition ${sidebarCollapsed ? 'w-14' : 'w-56'}`}>
        {/* Logo area */}
        <div className="flex-none h-12 flex items-center px-3 border-b border-navy-mid/30">
          {!sidebarCollapsed && <CapgeminiLogo className="h-5 w-auto" />}
          {sidebarCollapsed && (
            <img
              src="https://cdn.brandfetch.io/capgemini.com"
              alt="Capgemini"
              className="w-8 h-8 rounded object-contain"
            />
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => goHome(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-cap-cyan/10 text-cap-cyan border border-cap-cyan/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-navy-mid/50 border border-transparent'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-none" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}

          {/* Divider */}
          <div className="h-px bg-navy-mid/50 my-2" />

          {/* Brand label */}
          {!sidebarCollapsed && (
            <p className="text-[9px] text-gray-600 uppercase tracking-wider font-semibold px-2.5 mb-1">Brands</p>
          )}

          {/* Brand list */}
          {brands.map(brand => {
            const isActive = view === 'brand' && selectedBrandId === brand.id
            return (
              <button
                key={brand.id}
                onClick={() => navigateTo('brand', { brandId: brand.id, label: brand.name })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-cap-cyan/10 text-white border border-cap-cyan/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-navy-mid/50 border border-transparent'
                }`}
                title={sidebarCollapsed ? brand.name : undefined}
              >
                <BrandLogo brand={brand} size="md" />
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <span className="block truncate">{brand.name}</span>
                    <span className="text-[9px] text-gray-600">{brand.region}</span>
                  </div>
                )}
              </button>
            )
          })}

          {/* Divider */}
          <div className="h-px bg-navy-mid/50 my-2" />

          {/* Settings */}
          <button
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-navy-mid/50 transition-all border border-transparent"
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 flex-none" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        {/* Collapse toggle */}
        <div className="flex-none border-t border-navy-mid/30 p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-navy-mid/50 transition-all text-xs"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Progress bar */}
        <div className="flex-none h-1 progress-bar-h" />

        {/* Header */}
        <header className="flex-none flex items-center justify-between px-5 py-2 bg-navy-light border-b border-navy-mid/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white tracking-wide">Agentic Supply Chain</span>
              <span className="text-[9px] text-gray-500 bg-navy-mid/50 px-1.5 py-0.5 rounded font-mono">v2.0</span>
            </div>
            <div className="h-4 w-px bg-navy-mid" />
            <Breadcrumb items={breadcrumbItems} onNavigate={navigateBack} />
          </div>
          <span className="text-[10px] text-gray-600 tracking-wider uppercase">Ahold Delhaize × Capgemini</span>
        </header>

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
    </WorkflowProvider>
  )
}
