import { useState, useEffect, useRef } from 'react'
import {
  Database, Brain, Tag, MessageSquare, UserCheck, Zap, Box, RefreshCw,
  GitBranch, Sparkles, Code, Table, Wrench, MessageCircle,
} from 'lucide-react'
import flowDefs from '../data/flow_definitions.json'
import useCases from '../data/use_cases.json'
import { ThinkingDots } from '../components/shared/TypewriterText'

const ICON_MAP = {
  Database, Brain, Tag, MessageSquare, UserCheck, Zap, Box, RefreshCw,
}

const NODE_STYLES = {
  data: { bg: 'bg-cap-blue/15', border: 'border-cap-blue/40', text: 'text-cap-blue', color: '#0058AB' },
  ml: { bg: 'bg-layer-ml/15', border: 'border-layer-ml/40', text: 'text-layer-ml', color: '#0058AB' },
  slm: { bg: 'bg-cap-cyan/15', border: 'border-cap-cyan/40', text: 'text-cap-cyan', color: '#1DB8F2' },
  llm: { bg: 'bg-cap-turquoise/15', border: 'border-cap-turquoise/40', text: 'text-cap-turquoise', color: '#00D5D0' },
  gate: { bg: 'bg-risk-amber/15', border: 'border-risk-amber/40', text: 'text-risk-amber', color: '#FEB100' },
  agent: { bg: 'bg-cap-orange/15', border: 'border-cap-orange/40', text: 'text-cap-orange', color: '#FF816E' },
  twin: { bg: 'bg-cap-teal/15', border: 'border-cap-teal/40', text: 'text-cap-teal', color: '#00828E' },
  feedback: { bg: 'bg-gray-500/15', border: 'border-gray-500/40', text: 'text-gray-400', color: '#6B7280' },
}

const LOG_COLORS = {
  autonomous: 'text-risk-green',
  escalated: 'text-risk-amber',
  overridden: 'text-risk-red',
}

/* ──────────────────────────────────────────────
   Tab 1: LangGraph — Scripted Orchestration
   ────────────────────────────────────────────── */
function LangGraphTab({ flow }) {
  const logRef = useRef(null)
  const [logCount, setLogCount] = useState(0)
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [rightPanel, setRightPanel] = useState('schema') // schema | tools | code

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count > flow.agentLog.length) { clearInterval(interval); return }
      setLogCount(count)
    }, 400)
    return () => clearInterval(interval)
  }, [flow])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logCount])

  useEffect(() => {
    const nodes = flow.nodes
    let idx = 0
    const interval = setInterval(() => {
      setActiveNodeId(nodes[idx % nodes.length].id)
      idx++
    }, 2000)
    return () => clearInterval(interval)
  }, [flow])

  const maxX = Math.max(...flow.nodes.map(n => n.x))
  const columns = Array.from({ length: maxX + 1 }, (_, x) =>
    flow.nodes.filter(n => n.x === x)
  )

  const lg = flow.langgraph

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top: Graph + Right panel */}
      <div className="flex-1 min-h-0 flex">
        {/* Node graph — left 65% */}
        <div className="flex-[65] relative p-4 overflow-hidden border-r border-navy-mid/30">
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {flow.edges.map((edge, idx) => {
              const fromNode = flow.nodes.find(n => n.id === edge.from)
              const toNode = flow.nodes.find(n => n.id === edge.to)
              if (!fromNode || !toNode) return null

              const colWidth = 100 / (maxX + 1)
              const fromX = (fromNode.x + 0.5) * colWidth
              const toX = (toNode.x + 0.5) * colWidth
              const fromY = 25 + fromNode.y * 50
              const toY = 25 + toNode.y * 50
              const isFeedback = edge.type === 'feedback'

              if (isFeedback) {
                return (
                  <path key={idx}
                    d={`M ${fromX}% ${fromY + 15}% Q ${(fromX + toX) / 2}% ${Math.max(fromY, toY) + 30}% ${toX}% ${toY + 15}%`}
                    fill="none" stroke="#6B7280" strokeWidth="1.5" className="animate-flow-feedback" opacity={0.5}
                  />
                )
              }

              // Conditional edge label
              const hasCondition = !!edge.condition
              const midX = (fromX + toX) / 2
              const midY = (fromY + toY) / 2

              return (
                <g key={idx}>
                  <line
                    x1={`${fromX}%`} y1={`${fromY}%`} x2={`${toX}%`} y2={`${toY}%`}
                    stroke={hasCondition ? '#FEB100' : (NODE_STYLES[toNode.type]?.color || '#1E2642')}
                    strokeWidth="1.5" className="animate-flow-line" opacity={0.6}
                    strokeDasharray={hasCondition ? '4 3' : undefined}
                  />
                  {hasCondition && (
                    <text x={`${midX}%`} y={`${midY - 2}%`} fill="#FEB100" fontSize="8" textAnchor="middle" fontFamily="monospace">
                      {edge.condition}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Nodes */}
          <div className="relative z-10 flex h-full" style={{ gap: '4px' }}>
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col justify-center gap-2">
                {col.map(node => {
                  const style = NODE_STYLES[node.type] || NODE_STYLES.data
                  const Icon = ICON_MAP[node.icon] || Database
                  const isActive = activeNodeId === node.id
                  const isGate = node.type === 'gate'

                  return (
                    <div key={node.id}
                      className={`relative rounded-xl border p-2.5 transition-all duration-500 ${style.bg} ${style.border} ${
                        isActive ? 'ring-1 ring-white/20 scale-[1.02]' : ''
                      } ${isGate ? 'ring-1 ring-risk-amber/20' : ''}`}
                      title={node.description}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${style.text} flex-none`} />
                        <span className="text-[10px] font-semibold text-white leading-tight">{node.label}</span>
                      </div>
                      <p className="text-[8px] text-gray-400 leading-snug line-clamp-2">{node.description}</p>

                      {isGate && (
                        <div className="mt-1.5 space-y-0.5">
                          <div className="text-[8px] text-risk-amber bg-risk-amber/10 rounded px-1 py-0.5 inline-block">{node.role}</div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-risk-green" />
                            <span className="text-[7px] text-risk-green">{node.liveStatus}</span>
                          </div>
                        </div>
                      )}

                      {isActive && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cap-cyan animate-pulse" />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — LangGraph details */}
        <div className="flex-[35] flex flex-col min-h-0 overflow-hidden">
          {/* Panel tabs */}
          <div className="flex-none flex border-b border-navy-mid/30">
            {[
              { id: 'schema', icon: Table, label: 'State' },
              { id: 'tools', icon: Wrench, label: 'Tools' },
              { id: 'code', icon: Code, label: 'Code' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setRightPanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium transition-all border-b-2 ${
                  rightPanel === tab.id
                    ? 'text-cap-cyan border-cap-cyan'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 min-h-0 overflow-auto p-3">
            {rightPanel === 'schema' && lg && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-mono text-cap-cyan bg-cap-cyan/10 px-1.5 py-0.5 rounded">FreshWasteState</span>
                  <span className="text-[9px] text-gray-500">TypedDict</span>
                </div>
                {lg.stateSchema.map(field => (
                  <div key={field.field} className="bg-navy/50 rounded-lg px-2.5 py-1.5 border border-navy-mid/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-risk-green">{field.field}</span>
                      <span className="text-[9px] font-mono text-gray-500">: {field.type}</span>
                    </div>
                    <p className="text-[8px] text-gray-500 mt-0.5">{field.description}</p>
                  </div>
                ))}
              </div>
            )}

            {rightPanel === 'tools' && lg && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-400 mb-2">{lg.tools.length} registered tools</p>
                {lg.tools.map(tool => (
                  <div key={tool.name} className="bg-navy/50 rounded-lg px-2.5 py-2 border border-navy-mid/50">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Wrench className="w-3 h-3 text-cap-orange flex-none" />
                      <span className="text-[10px] font-mono text-cap-orange">{tool.name}</span>
                    </div>
                    <p className="text-[9px] text-gray-400">{tool.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-gray-600">returns:</span>
                      <span className="text-[8px] font-mono text-cap-cyan">{tool.returns}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rightPanel === 'code' && lg && (
              <div className="bg-[#0a0c14] rounded-lg p-3 border border-[#1a1e30]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-gray-500 font-mono">fresh_waste_graph.py</span>
                  <span className="text-[8px] text-cap-cyan bg-cap-cyan/10 px-1.5 py-0.5 rounded">LangGraph</span>
                </div>
                <pre className="text-[9px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed overflow-auto">
                  {lg.code}
                </pre>
              </div>
            )}

            {!lg && (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-[10px] text-gray-500">LangGraph definition not available for this use case</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Agent log */}
      <div className="flex-none h-[35%] min-h-0 border-t border-navy-mid/30 flex flex-col">
        <div className="flex-none flex items-center justify-between px-4 py-1.5">
          <h3 className="text-[11px] font-semibold text-gray-300">Execution Trace</h3>
          <div className="flex items-center gap-3 text-[9px]">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-risk-green" /><span className="text-gray-500">Autonomous</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-risk-amber" /><span className="text-gray-500">Escalated</span></div>
            <span className="text-gray-600 font-mono">{logCount}/{flow.agentLog.length}</span>
          </div>
        </div>
        <div ref={logRef} className="flex-1 min-h-0 bg-[#0a0c14] mx-4 mb-2 rounded-lg p-2.5 font-mono text-[10px] overflow-auto border border-[#1a1e30]">
          {flow.agentLog.slice(0, logCount).map((entry, i) => {
            const isLatest = i === logCount - 1
            return (
              <div key={i} className={`flex items-start gap-2 py-0.5 ${isLatest ? 'animate-slide-in' : ''}`}>
                <span className="text-gray-600 flex-none w-10">{entry.time}</span>
                <span className={`flex-none w-2 ${LOG_COLORS[entry.type]}`}>
                  {entry.type === 'escalated' ? '\u26A0' : '\u2713'}
                </span>
                <span className={`${LOG_COLORS[entry.type]} ${isLatest ? 'text-white' : ''}`}>{entry.action}</span>
              </div>
            )
          })}
          {logCount < flow.agentLog.length && (
            <div className="flex items-center gap-2 mt-1"><span className="text-cap-orange animate-pulse">{'\u258A'}</span></div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Tab 2: GenAI — Unscripted Deliberation
   ────────────────────────────────────────────── */
function GenAITab({ flow, useCaseDef }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const chatRef = useRef(null)
  const messages = flow.genai_deliberation || []

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count > messages.length) { clearInterval(interval); return }
      setVisibleCount(count)
    }, 1200)
    return () => clearInterval(interval)
  }, [messages])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [visibleCount])

  if (!messages.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">GenAI Deliberation</p>
          <p className="text-[10px] text-gray-500 mt-1 max-w-xs">
            {useCaseDef?.unscriptedDescription || 'Claude-powered scenario simulation and interactive deliberation for this use case.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Info bar */}
      <div className="flex-none px-4 py-2 bg-navy-light border-b border-navy-mid/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-cap-turquoise/15 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-cap-turquoise" />
          </div>
          <div>
            <span className="text-[11px] text-white font-medium">Claude — Scenario Deliberation</span>
            <span className="text-[9px] text-gray-500 ml-2">Interactive simulation & review</span>
          </div>
        </div>
        <span className="text-[9px] text-gray-500 font-mono">claude-sonnet-4-20250514</span>
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
        {messages.slice(0, visibleCount).map((msg, i) => {
          const isLatest = i === visibleCount - 1
          const isSystem = msg.role === 'system'
          const isUser = msg.role === 'user'
          const isAssistant = msg.role === 'assistant'

          if (isSystem) {
            return (
              <div key={i} className={`text-center ${isLatest ? 'animate-slide-in' : ''}`}>
                <div className="inline-flex items-center gap-2 bg-navy-mid/50 rounded-full px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cap-cyan animate-pulse" />
                  <span className="text-[10px] text-gray-400">{msg.content}</span>
                </div>
              </div>
            )
          }

          if (isUser) {
            return (
              <div key={i} className={`flex justify-end ${isLatest ? 'animate-slide-in' : ''}`}>
                <div className="max-w-[75%] bg-cap-blue/20 border border-cap-blue/30 rounded-xl rounded-tr-sm px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-4 h-4 rounded-full bg-cap-blue flex items-center justify-center text-[7px] font-bold">KC</div>
                    <span className="text-[9px] text-cap-light-blue font-medium">Karin Chu</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          }

          if (isAssistant) {
            return (
              <div key={i} className={`flex justify-start ${isLatest ? 'animate-slide-in' : ''}`}>
                <div className={`max-w-[85%] rounded-xl rounded-tl-sm px-3 py-2 ${
                  msg.scenarios
                    ? 'bg-cap-turquoise/5 border border-cap-turquoise/20'
                    : 'bg-navy-light border border-navy-mid'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-4 h-4 rounded-lg bg-cap-turquoise/20 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-cap-turquoise" />
                    </div>
                    <span className="text-[9px] text-cap-turquoise font-medium">Claude</span>
                    {msg.scenarios && (
                      <span className="text-[8px] text-cap-turquoise bg-cap-turquoise/10 px-1.5 py-0.5 rounded ml-1">Scenario Analysis</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            )
          }

          return null
        })}

        {visibleCount < messages.length && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-4 h-4 rounded-lg bg-cap-turquoise/20 flex items-center justify-center">
              <ThinkingDots />
            </div>
            <span className="text-[10px] text-cap-turquoise">Claude is thinking...</span>
          </div>
        )}
      </div>

      {/* Input (cosmetic) */}
      <div className="flex-none border-t border-navy-mid/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Claude about scenarios, trade-offs, or alternatives..."
            className="flex-1 bg-navy border border-navy-mid rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cap-turquoise/40"
            disabled
          />
          <button className="p-2 bg-cap-turquoise/20 text-cap-turquoise rounded-lg opacity-50 cursor-not-allowed">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main: AgentFlowView with tab switcher
   ────────────────────────────────────────────── */
export default function AgentFlowView({ useCaseId = 'uc-fresh-waste' }) {
  const flow = flowDefs[useCaseId]
  const useCaseDef = useCases.find(uc => uc.id === useCaseId)
  const [activeTab, setActiveTab] = useState('langgraph')

  if (!flow) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header for non-flow use cases */}
        <div className="flex-none px-5 py-3 border-b border-navy-mid/30">
          <h2 className="text-sm font-semibold text-white">{useCaseDef?.name || 'Agent Flow'}</h2>
          <p className="text-[10px] text-gray-500">Flow definition not available for this use case</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          {/* Execution model info */}
          {useCaseDef && (
            <div className="max-w-lg w-full space-y-4">
              <div className="text-center mb-6">
                <ExecutionModelBadge model={useCaseDef.executionModel} size="lg" />
                <p className="text-xs text-gray-400 mt-3">This use case uses a {useCaseDef.executionModel} execution model</p>
              </div>

              {useCaseDef.scriptedDescription && (
                <div className="bg-navy-light rounded-xl border border-cap-blue/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-cap-blue" />
                    <span className="text-xs font-semibold text-cap-blue">Scripted — LangGraph</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{useCaseDef.scriptedDescription}</p>
                </div>
              )}

              {useCaseDef.unscriptedDescription && (
                <div className="bg-navy-light rounded-xl border border-cap-turquoise/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-cap-turquoise" />
                    <span className="text-xs font-semibold text-cap-turquoise">Unscripted — GenAI</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{useCaseDef.unscriptedDescription}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with tab switcher */}
      <div className="flex-none px-5 py-2.5 border-b border-navy-mid/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">{flow.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <ExecutionModelBadge model={useCaseDef?.executionModel} />
            <span className="text-[10px] text-gray-500">{flow.nodes.length} nodes · {flow.edges.length} edges · {flow.agentLog.length} actions</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-navy/60 rounded-lg border border-navy-mid p-0.5">
          <button
            onClick={() => setActiveTab('langgraph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'langgraph'
                ? 'bg-cap-blue/20 text-cap-light-blue border border-cap-blue/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            LangGraph
          </button>
          <button
            onClick={() => setActiveTab('genai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'genai'
                ? 'bg-cap-turquoise/20 text-cap-turquoise border border-cap-turquoise/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            GenAI Deliberation
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'langgraph' ? (
          <LangGraphTab flow={flow} />
        ) : (
          <GenAITab flow={flow} useCaseDef={useCaseDef} />
        )}
      </div>
    </div>
  )
}

/* ──── Execution Model Badge ──── */
function ExecutionModelBadge({ model, size = 'sm' }) {
  const config = {
    hybrid: { label: 'Hybrid', icon: '\u2194', colors: 'text-cap-cyan bg-cap-cyan/10 border-cap-cyan/20' },
    scripted: { label: 'Scripted', icon: '\u2192', colors: 'text-cap-blue bg-cap-blue/10 border-cap-blue/20' },
    unscripted: { label: 'Unscripted', icon: '\u2731', colors: 'text-cap-turquoise bg-cap-turquoise/10 border-cap-turquoise/20' },
  }[model] || { label: model || 'Unknown', icon: '?', colors: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${config.colors}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold ${config.colors}`}>
      {config.icon} {config.label}
    </span>
  )
}

export { ExecutionModelBadge }
