import { useState, useEffect, useCallback } from 'react'
import { useWorkflow } from './context/WorkflowContext'
import S0_ControlTower from './components/S0_ControlTower'
import S2_AlertAnalysis from './components/S2_AlertAnalysis'
import S4_Simulation from './components/S4_Simulation'
import S5_Governance from './components/S5_Governance'
import S6_Execution from './components/S6_Execution'
import S7_Verification from './components/S7_Verification'
import DT1_Overview from './components/DT1_Overview'
import DT2_BurlingtonNC from './components/DT2_BurlingtonNC'
import DT3_WhatIf from './components/DT3_WhatIf'
import DT4_FeedbackLoop from './components/DT4_FeedbackLoop'
import DT5_ValueAtScale from './components/DT5_ValueAtScale'

// Workflow 1: Fresh Waste Intervention (6 screens)
const INTERVENTION_SCREENS = [
  { id: 0, title: 'Supply Chain Control Tower', subtitle: 'RAISE 2.0 — Live AI Orchestration Platform', hasInteraction: true },
  { id: 1, title: 'Alert Analysis & AI Brief', subtitle: 'Risk Assessment + SLM Classification + LLM Synthesis', hasInteraction: true },
  { id: 2, title: 'Scenario Simulation', subtitle: 'Digital Twin — Monte Carlo Analysis', hasInteraction: true },
  { id: 3, title: 'Governance & Approval', subtitle: 'Human-in-the-Loop — Threshold Escalation', hasInteraction: true },
  { id: 4, title: 'Autonomous Execution', subtitle: 'RAISE 2.0 — Agentic AI Platform', hasInteraction: false },
  { id: 5, title: 'Outcome & Results', subtitle: 'Before/After Impact — Intervention Complete', hasInteraction: true },
]
const INTERVENTION_COMPONENTS = [S0_ControlTower, S2_AlertAnalysis, S4_Simulation, S5_Governance, S6_Execution, S7_Verification]
const INTERVENTION_COLORS = ['#0058AB', '#FF816E', '#1DB8F2', '#FEB100', '#FF816E', '#00D5D0']

// Workflow 2: Digital Twin & Scale (5 screens)
const DT_SCREENS = [
  { id: 0, title: 'Digital Twin Overview', subtitle: 'What is a Digital Twin? Why do we need it?', hasInteraction: true },
  { id: 1, title: 'Burlington NC — DC Design', subtitle: 'Distribution Center Optimization Case Study', hasInteraction: true },
  { id: 2, title: 'What-If Scenario Testing', subtitle: 'Monte Carlo Simulation — DC Design Change', hasInteraction: true },
  { id: 3, title: 'Feedback Loop & Model Learning', subtitle: 'MAPE Improvement + Recent Invocations', hasInteraction: true },
  { id: 4, title: 'Value at Scale', subtitle: 'Group-Wide Impact — €220-340M Projection', hasInteraction: true },
]
const DT_COMPONENTS = [DT1_Overview, DT2_BurlingtonNC, DT3_WhatIf, DT4_FeedbackLoop, DT5_ValueAtScale]
const DT_COLORS = ['#00828E', '#0058AB', '#1DB8F2', '#00D5D0', '#FF816E']

function getWorkflowConfig(workflowId) {
  if (workflowId === 'digital-twin') {
    return { screens: DT_SCREENS, components: DT_COMPONENTS, colors: DT_COLORS }
  }
  return { screens: INTERVENTION_SCREENS, components: INTERVENTION_COMPONENTS, colors: INTERVENTION_COLORS }
}

function CapgeminiLogo({ className = '' }) {
  return (
    <svg viewBox="0 0 180 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14 4C14 4 6 10 6 18C6 22.4 9.6 26 14 26C14.8 26 15.6 25.9 16.3 25.6L14 32H18L15.7 25.6C16.4 25.9 17.2 26 18 26C22.4 26 26 22.4 26 18C26 10 18 4 18 4C18 4 17 7 16 7C15 7 14 4 14 4Z" fill="#1DB8F2"/>
      <text x="34" y="26" fontFamily="Ubuntu, Verdana, sans-serif" fontSize="18" fontWeight="400" fill="white">Capgemini</text>
    </svg>
  )
}

// Inner component containing all workflow logic
function AppInner({ embedded, workflow, onBack, workflowId = 'intervention' }) {
  const { screens: SCREENS, components: SCREEN_COMPONENTS, colors: ACCENT_COLORS } = getWorkflowConfig(workflowId)
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [workflowState, setWorkflowState] = useState({
    briefRead: false,
    simulationRun: false,
    scenarioSelected: null,
    approvalGiven: false,
    executionComplete: false,
  })

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < SCREENS.length && !isAnimating) {
      setIsAnimating(true)
      setCurrentScreen(idx)
      // Sync with workflow context when embedded
      if (workflow) workflow.advanceScreen(idx)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }, [isAnimating, workflow])

  const handleAction = useCallback((action, value) => {
    switch (action) {
      case 'investigate':
        goTo(1)
        break
      case 'briefRead':
        setWorkflowState(s => ({ ...s, briefRead: true }))
        goTo(2)
        break
      case 'simulationRun':
        setWorkflowState(s => ({ ...s, simulationRun: true }))
        // Signal Digital Twin node to pulse in flow bar
        if (workflow) workflow.setNodeOverride('digital-twin', 'pulsing')
        break
      case 'scenarioSelected':
        setWorkflowState(s => ({ ...s, scenarioSelected: value }))
        // Mark Digital Twin as completed in flow bar
        if (workflow) workflow.setNodeOverride('digital-twin', 'completed')
        break
      case 'proceedToApproval':
        goTo(3)
        break
      case 'approvalGiven':
        setWorkflowState(s => ({ ...s, approvalGiven: true }))
        // Flash Human Approval gate to approved (green)
        if (workflow) workflow.setNodeOverride('human-approval', 'approved')
        setTimeout(() => goTo(4), 1500)
        break
      case 'executionComplete':
        setWorkflowState(s => ({ ...s, executionComplete: true }))
        // Mark Execute Action as done
        if (workflow) workflow.setNodeOverride('execute-action', 'completed')
        // Auto-advance to Outcome & Results after a delay
        setTimeout(() => goTo(5), 2000)
        break
      case 'backToDashboard':
        if (onBack) onBack()
        break
      // Digital Twin workflow actions
      case 'exploreBurlington':
        goTo(1)
        break
      case 'runWhatIf':
        goTo(2)
        break
      case 'whatIfComplete':
        // Simulation finished, no auto-advance
        break
      case 'seeModelLearning':
        goTo(3)
        break
      case 'seeGroupImpact':
        goTo(4)
        break
      case 'complete':
        if (onBack) onBack()
        break
    }
  }, [goTo, workflow, onBack])

  useEffect(() => {
    if (embedded) return // Don't capture keyboard when embedded in platform shell

    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        goTo(currentScreen + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goTo(currentScreen - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(SCREENS.length - 1)
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) {
          document.documentElement.requestFullscreen?.()
        }
      } else if (e.key === 'Escape') {
        document.exitFullscreen?.()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentScreen, goTo, embedded])

  const ScreenComponent = SCREEN_COMPONENTS[currentScreen]
  const screen = SCREENS[currentScreen]

  // When embedded in PlatformShell, render just the workflow content
  if (embedded) {
    return (
      <div className="w-full h-full bg-navy flex flex-col overflow-hidden">
        {/* Compact header with nav */}
        <div className="flex-none flex items-center justify-between px-4 py-1.5 bg-navy-light border-b border-navy-mid/50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ACCENT_COLORS[currentScreen] }} />
            <div>
              <h2 className="text-sm font-medium text-white leading-tight">{screen.title}</h2>
              <p className="text-[9px] text-gray-500 font-light">{screen.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentScreen < SCREENS.length - 1 && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-cap-blue flex items-center justify-center text-[8px] font-bold text-white">KC</div>
                <span className="text-[9px] text-gray-400">Karin Chu</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-navy/60 px-2.5 py-1 rounded-full border border-cap-cyan/20">
              <button onClick={() => goTo(currentScreen - 1)} className="w-5 h-5 rounded-full border border-cap-cyan/40 text-cap-cyan flex items-center justify-center text-[10px] hover:bg-cap-cyan hover:text-navy-light transition-all">&lsaquo;</button>
              <div className="flex items-center gap-0.5">
                {SCREENS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentScreen ? 'bg-cap-cyan w-4' : i < currentScreen ? 'bg-cap-blue w-1.5' : 'bg-navy-mid w-1.5'
                    }`}
                  />
                ))}
              </div>
              <button onClick={() => goTo(currentScreen + 1)} className="w-5 h-5 rounded-full border border-cap-cyan/40 text-cap-cyan flex items-center justify-center text-[10px] hover:bg-cap-cyan hover:text-navy-light transition-all">&rsaquo;</button>
              <span className="text-[9px] text-gray-500 ml-0.5">{currentScreen + 1}/{SCREENS.length}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <div key={currentScreen} className="w-full h-full animate-slide-in">
            <ScreenComponent workflowState={workflowState} onAction={handleAction} />
          </div>
        </main>

        {/* Compact footer */}
        <footer className="flex-none flex items-center justify-between px-4 py-1 bg-navy-light border-t border-navy-mid/50 text-[9px]">
          <span className="text-gray-600">
            Click action buttons to progress through the workflow
          </span>
          <span className="text-gray-600 tracking-wider uppercase">Confidential</span>
        </footer>
      </div>
    )
  }

  // Standalone mode — original full layout
  return (
    <div className="w-screen h-screen bg-navy flex flex-col overflow-hidden">
      {/* Progress bar gradient */}
      <div className="flex-none h-1 progress-bar-h" />

      {/* Top bar */}
      <header className="flex-none flex items-center justify-between px-6 py-2 bg-navy-light border-b border-navy-mid/50">
        <div className="flex items-center gap-4">
          <CapgeminiLogo className="h-5 w-auto" />
          <div className="h-5 w-px bg-navy-mid" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#00529B] flex items-center justify-center font-bold text-[10px] tracking-tight">AH</div>
            <div>
              <h1 className="text-sm font-medium text-white tracking-wide leading-tight">Predictive Fresh Supply Chain</h1>
              <p className="text-[10px] text-gray-500 font-light">Ahold Delhaize × Capgemini</p>
            </div>
          </div>
        </div>

        {/* Navigation pill */}
        <div className="flex items-center gap-3 bg-navy/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#1DB8F2]/20">
          <button onClick={() => goTo(currentScreen - 1)} className="w-6 h-6 rounded-full border border-[#1DB8F2]/40 text-[#1DB8F2] flex items-center justify-center text-xs hover:bg-[#1DB8F2] hover:text-navy-light transition-all">&lsaquo;</button>
          <div className="flex items-center gap-1">
            {SCREENS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentScreen
                    ? 'bg-[#1DB8F2] w-5'
                    : i < currentScreen
                    ? 'bg-cap-blue w-2'
                    : 'bg-navy-mid w-2'
                }`}
              />
            ))}
          </div>
          <button onClick={() => goTo(currentScreen + 1)} className="w-6 h-6 rounded-full border border-[#1DB8F2]/40 text-[#1DB8F2] flex items-center justify-center text-xs hover:bg-[#1DB8F2] hover:text-navy-light transition-all">&rsaquo;</button>
          <span className="text-[10px] text-gray-500 font-light tracking-wider ml-1">{currentScreen + 1} / {SCREENS.length}</span>
        </div>
      </header>

      {/* Persona banner + screen title */}
      <div className="flex-none px-6 py-2 bg-navy border-b border-navy-mid/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full" style={{ backgroundColor: ACCENT_COLORS[currentScreen] }} />
            <div>
              <h2 className="text-base font-medium text-white leading-tight">{screen.title}</h2>
              <p className="text-[10px] text-gray-500 font-light">{screen.subtitle}</p>
            </div>
          </div>
          {currentScreen < SCREENS.length - 1 && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cap-blue flex items-center justify-center text-[10px] font-bold text-white">KC</div>
              <div className="text-right">
                <p className="text-[10px] text-gray-300 font-medium">Karin Chu</p>
                <p className="text-[8px] text-gray-500">Category Manager Fresh</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div key={currentScreen} className="w-full h-full animate-slide-in">
          <ScreenComponent workflowState={workflowState} onAction={handleAction} />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none flex items-center justify-between px-6 py-1.5 bg-navy-light border-t border-navy-mid/50 text-[10px]">
        <span className="text-gray-600 font-light">
          {screen.hasInteraction
            ? 'Arrow keys to navigate · Click highlighted buttons to interact · F for fullscreen'
            : 'Arrow keys to navigate · F for fullscreen · Home to reset'}
        </span>
        <span className="text-gray-600 font-light tracking-wider uppercase">Ahold Delhaize × Capgemini — Confidential</span>
      </footer>
    </div>
  )
}

// Embedded wrapper that connects to WorkflowContext
function AppEmbedded({ onBack, workflowId }) {
  const workflow = useWorkflow()
  return <AppInner embedded={true} workflow={workflow} onBack={onBack} workflowId={workflowId} />
}

// Main export — routes to embedded or standalone
export default function App({ embedded = false, onBack, workflowId = 'intervention' }) {
  if (embedded) {
    return <AppEmbedded onBack={onBack} workflowId={workflowId} />
  }
  return <AppInner embedded={false} workflow={null} onBack={onBack} workflowId={workflowId} />
}
