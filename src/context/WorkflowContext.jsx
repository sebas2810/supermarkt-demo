import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const WorkflowContext = createContext(null)

// Screen-to-node mapping for 6-screen workflow: which LangGraph nodes are active/completed per screen
const SCREEN_NODE_MAP = {
  0: { active: [], completed: [] },
  1: { active: ['iot-sensors', 'relex-forecast', 'risk-scoring', 'classification', 'decision-brief'], completed: [] },
  2: { active: ['digital-twin'], completed: ['iot-sensors', 'relex-forecast', 'risk-scoring', 'classification', 'decision-brief'] },
  3: { active: ['human-approval'], completed: ['iot-sensors', 'relex-forecast', 'risk-scoring', 'classification', 'decision-brief', 'digital-twin'] },
  4: { active: ['execute-action'], completed: ['iot-sensors', 'relex-forecast', 'risk-scoring', 'classification', 'decision-brief', 'digital-twin', 'human-approval'] },
  5: { active: ['model-retrain'], completed: ['iot-sensors', 'relex-forecast', 'risk-scoring', 'classification', 'decision-brief', 'digital-twin', 'human-approval', 'execute-action'] },
}

// Screen-to-edge mapping: which edges animate per screen
// Edges light up left-to-right matching the node activation order
const SCREEN_EDGE_MAP = {
  0: [],
  1: [
    { from: 'iot-sensors', to: 'risk-scoring' },
    { from: 'relex-forecast', to: 'risk-scoring' },
    { from: 'risk-scoring', to: 'classification' },
    { from: 'classification', to: 'decision-brief' },
  ],
  2: [
    { from: 'decision-brief', to: 'digital-twin' },
  ],
  3: [
    { from: 'digital-twin', to: 'human-approval' },
  ],
  4: [
    { from: 'human-approval', to: 'execute-action' },
  ],
  5: [
    { from: 'execute-action', to: 'model-retrain' },
    { from: 'model-retrain', to: 'risk-scoring' },
  ],
}

// Agent log entries keyed by screen
const SCREEN_LOG_ENTRIES = {
  0: [],
  1: [
    { time: '06:15', action: 'Cold chain alert received — Bakker Bart Zaandam transit', type: 'autonomous' },
    { time: '06:16', action: 'IoT data ingested: +2.3°C exceedance for 4.2 hours', type: 'autonomous' },
    { time: '06:18', action: 'RELEX forecast variance detected: -23% sell-through', type: 'autonomous' },
    { time: '06:22', action: 'Risk model scored: 8.4/10 — HIGH RISK', type: 'autonomous' },
    { time: '06:23', action: 'SLM classified: Tier 3 — Autonomous action authorised', type: 'autonomous' },
    { time: '06:30', action: 'LLM brief generated — 3,400 units at risk across 3 stores', type: 'autonomous' },
  ],
  2: [
    { time: '06:31', action: 'Digital twin: running 500 Monte Carlo simulations', type: 'autonomous' },
    { time: '06:32', action: 'Scenario A (Markdown): 2,800 units saved, €4,172 revenue', type: 'autonomous' },
    { time: '06:32', action: 'Scenario B (Re-route): 1,900 units saved, €4,351 revenue', type: 'autonomous' },
  ],
  3: [
    { time: '07:15', action: '⚠ ESCALATED: Units (3,400) exceed threshold (500)', type: 'escalated' },
    { time: '07:15', action: 'Notification sent to K. Chu (Category Manager Fresh)', type: 'escalated' },
  ],
  4: [
    { time: '07:38', action: '✓ APPROVED by K. Chu — executing markdown', type: 'escalated' },
    { time: '07:38', action: 'POS update: AH-0041 Almere Stad — €1.49', type: 'autonomous' },
    { time: '07:39', action: 'POS update: AH-0087 Utrecht — €1.49', type: 'autonomous' },
    { time: '07:39', action: 'POS update: AH-0112 Amsterdam Bijlmer — €1.49', type: 'autonomous' },
    { time: '07:40', action: 'ESL labels updated across 3 stores', type: 'autonomous' },
  ],
  5: [
    { time: '07:41', action: 'Outcome tracking initiated — monitoring sell-through', type: 'autonomous' },
    { time: '14:00', action: 'Verification: 2,800 units sold, simulation accuracy 94%', type: 'autonomous' },
    { time: '18:00', action: 'Closed-loop feedback: model retrained with outcome data', type: 'autonomous' },
    { time: '18:01', action: 'MAPE improved: 9.2% → 8.4% (+0.8pp)', type: 'autonomous' },
  ],
}

export function WorkflowProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [workflowCompleted, setWorkflowCompleted] = useState(false)
  const [nodeOverrides, setNodeOverrides] = useState({})
  const [highestScreen, setHighestScreen] = useState(0)

  const advanceScreen = useCallback((idx) => {
    setCurrentScreen(idx)
    setHighestScreen(prev => Math.max(prev, idx))
    if (idx >= 5) setWorkflowCompleted(true)
  }, [])

  const setNodeOverride = useCallback((nodeId, state) => {
    setNodeOverrides(prev => ({ ...prev, [nodeId]: state }))
  }, [])

  const clearNodeOverride = useCallback((nodeId) => {
    setNodeOverrides(prev => {
      const next = { ...prev }
      delete next[nodeId]
      return next
    })
  }, [])

  // Computed: cumulative log entries up to current screen
  const cumulativeLog = useMemo(() => {
    const entries = []
    for (let i = 0; i <= currentScreen; i++) {
      entries.push(...(SCREEN_LOG_ENTRIES[i] || []))
    }
    return entries
  }, [currentScreen])

  const nodeMap = SCREEN_NODE_MAP[currentScreen] || { active: [], completed: [] }
  const activeEdges = SCREEN_EDGE_MAP[currentScreen] || []

  const value = useMemo(() => ({
    currentScreen,
    advanceScreen,
    workflowCompleted,
    nodeMap,
    activeEdges,
    nodeOverrides,
    setNodeOverride,
    clearNodeOverride,
    cumulativeLog,
    highestScreen,
  }), [currentScreen, advanceScreen, workflowCompleted, nodeMap, activeEdges, nodeOverrides, setNodeOverride, clearNodeOverride, cumulativeLog, highestScreen])

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  return useContext(WorkflowContext)
}

// Safe version that returns a default when outside provider
export function useWorkflowSafe() {
  const ctx = useContext(WorkflowContext)
  return ctx || { workflowCompleted: false, currentScreen: 0, nodeMap: { active: [], completed: [] }, activeEdges: [], nodeOverrides: {}, cumulativeLog: [] }
}

export default WorkflowContext
