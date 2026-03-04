import { useMemo } from 'react'
import { useWorkflow } from '../../context/WorkflowContext'
import flowDefs from '../../data/flow_definitions.json'

const NODE_STYLES = {
  data:     { color: '#0058AB' },
  ml:       { color: '#0058AB' },
  slm:      { color: '#1DB8F2' },
  llm:      { color: '#00D5D0' },
  gate:     { color: '#FEB100' },
  agent:    { color: '#FF816E' },
  twin:     { color: '#00828E' },
  feedback: { color: '#6B7280' },
}

const NODE_ICONS = {
  data: '⬡', ml: '◈', slm: '◇', llm: '◆', gate: '⊘', agent: '⚡', twin: '◎', feedback: '↻',
}

export default function WorkflowFlowBar() {
  const { nodeMap, activeEdges, nodeOverrides, currentScreen } = useWorkflow()
  const flow = flowDefs['uc-fresh-waste']

  const nodes = useMemo(() =>
    [...flow.nodes].sort((a, b) => a.x - b.x || a.y - b.y),
    [flow]
  )

  const maxX = Math.max(...nodes.map(n => n.x))

  // Larger viewBox for better readability — extra top space for feedback arc
  const W = 1000
  const H = 88
  const NODE_Y_CENTER = 48 // push nodes down slightly to make room for feedback arc above
  const nodePositions = useMemo(() => {
    const pos = {}
    nodes.forEach(node => {
      const xPct = (node.x + 0.5) / (maxX + 1)
      const yOffset = node.y * 22
      pos[node.id] = {
        cx: 50 + xPct * (W - 100),
        cy: NODE_Y_CENTER + yOffset,
      }
    })
    return pos
  }, [nodes, maxX])

  const getNodeState = (nodeId) => {
    if (nodeOverrides[nodeId]) return nodeOverrides[nodeId]
    if (nodeMap.active.includes(nodeId)) return 'active'
    if (nodeMap.completed.includes(nodeId)) return 'completed'
    return 'pending'
  }

  const isEdgeActive = (from, to) =>
    activeEdges.some(ae => ae.from === from && ae.to === to)

  return (
    <div className="flex-none bg-navy-light/80 border-b border-navy-mid/30 backdrop-blur-sm px-3 py-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-none flex flex-col items-center w-10">
          <span className="text-[7px] text-gray-600 uppercase tracking-wider">Flow</span>
          <span className="text-[9px] text-gray-500 font-mono">{currentScreen + 1}/6</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1" style={{ height: '76px' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow-active">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-done">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Edges — connect right side of source to left side of target */}
          {flow.edges.map((edge, idx) => {
            const from = nodePositions[edge.from]
            const to = nodePositions[edge.to]
            if (!from || !to) return null

            const nw = 80, nh = 30
            const isFeedback = edge.type === 'feedback'
            const isConditional = !!edge.condition
            const active = isEdgeActive(edge.from, edge.to)
            const toNode = flow.nodes.find(n => n.id === edge.to)
            const edgeColor = active
              ? (isConditional ? '#FEB100' : (NODE_STYLES[toNode?.type]?.color || '#1DB8F2'))
              : '#1E2642'

            // Feedback edge: curves ABOVE the nodes (within viewBox)
            if (isFeedback) {
              const x1 = from.cx + nw / 2
              const x2 = to.cx + nw / 2
              const curveY = 4 // curve above the top of nodes
              return (
                <path key={idx}
                  d={`M ${x1} ${from.cy - nh / 2} C ${x1 + 30} ${curveY}, ${x2 - 30} ${curveY}, ${x2} ${to.cy - nh / 2}`}
                  fill="none"
                  stroke={active ? '#6B7280' : '#1E2642'}
                  strokeWidth={active ? 1.5 : 0.6}
                  strokeDasharray="4 3"
                  className={active ? 'animate-flow-feedback' : ''}
                  opacity={active ? 0.5 : 0.1}
                  markerEnd={active ? undefined : undefined}
                />
              )
            }

            // Edge start: right side of source node; Edge end: left side of target node
            const x1 = from.cx + nw / 2
            const y1 = from.cy
            const x2 = to.cx - nw / 2
            const y2 = to.cy

            // Curved path for nodes at different Y positions (relex-forecast → risk-scoring)
            const dy = Math.abs(y2 - y1)
            if (dy > 5) {
              const midX = (x1 + x2) / 2
              return (
                <path key={idx}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={active ? 1.8 : 0.8}
                  strokeDasharray={isConditional ? '4 3' : (active ? '6 4' : undefined)}
                  className={active ? 'animate-flow-line' : ''}
                  opacity={active ? 0.8 : 0.12}
                />
              )
            }

            // Straight horizontal line between same-Y nodes
            return (
              <line key={idx}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke={edgeColor}
                strokeWidth={active ? 1.8 : 0.8}
                strokeDasharray={isConditional ? '4 3' : (active ? '6 4' : undefined)}
                className={active ? 'animate-flow-line' : ''}
                opacity={active ? 0.8 : 0.12}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = nodePositions[node.id]
            const state = getNodeState(node.id)
            const style = NODE_STYLES[node.type]
            const nw = 80, nh = 30

            let fillOpacity = 0.05
            let strokeColor = '#1E2642'
            let strokeW = 0.8
            let labelColor = '#4B5563'

            if (state === 'completed' || state === 'approved') {
              fillOpacity = 0.15
              strokeColor = '#00D5D0'
              strokeW = 2
              labelColor = '#00D5D0'
            } else if (state === 'active' || state === 'pulsing' || state === 'executing') {
              fillOpacity = 0.15
              strokeColor = '#1DB8F2'
              strokeW = 2.5
              labelColor = '#1DB8F2'
            }

            const isActive = state === 'active' || state === 'pulsing' || state === 'executing'
            const isDone = state === 'completed' || state === 'approved'

            return (
              <g key={node.id}>
                {/* Outer pulse ring for active */}
                {isActive && (
                  <rect
                    x={pos.cx - nw / 2 - 4} y={pos.cy - nh / 2 - 4}
                    width={nw + 8} height={nh + 8}
                    rx={10} fill="none"
                    stroke={strokeColor} strokeWidth={1.5}
                    opacity={0.3}
                  >
                    <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}

                {/* Completed fill */}
                {isDone && (
                  <rect
                    x={pos.cx - nw / 2} y={pos.cy - nh / 2}
                    width={nw} height={nh}
                    rx={8}
                    fill="#00D5D0" fillOpacity={0.1}
                    stroke="none"
                  />
                )}

                {/* Node rect */}
                <rect
                  x={pos.cx - nw / 2} y={pos.cy - nh / 2}
                  width={nw} height={nh}
                  rx={8}
                  fill={isDone ? 'none' : style.color} fillOpacity={isDone ? 0 : fillOpacity}
                  stroke={strokeColor} strokeWidth={strokeW}
                  filter={isActive ? 'url(#glow-active)' : undefined}
                />

                {/* Content inside node */}
                {isDone ? (
                  <>
                    <text x={pos.cx - 15} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fill="#00D5D0" fontSize="12" fontWeight="bold">✓</text>
                    <text x={pos.cx + 12} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fill="#00D5D0" fontSize="7.5" fontWeight="600" fontFamily="Ubuntu, sans-serif">
                      {node.label.length > 12 ? node.label.substring(0, 11) + '..' : node.label}
                    </text>
                  </>
                ) : (
                  <>
                    <text x={pos.cx - 18} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={isActive ? labelColor : style.color} fontSize="11" opacity={isActive ? 0.9 : 0.3}>
                      {NODE_ICONS[node.type]}
                    </text>
                    <text x={pos.cx + 12} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={isActive ? labelColor : '#4B5563'} fontSize="7.5"
                      fontWeight={isActive ? '600' : '400'}
                      fontFamily="Ubuntu, sans-serif" opacity={isActive ? 1 : 0.5}>
                      {node.label.length > 12 ? node.label.substring(0, 11) + '..' : node.label}
                    </text>
                  </>
                )}

                {/* Full label below node — always visible */}
                <text x={pos.cx} y={pos.cy + nh / 2 + 10} textAnchor="middle"
                  fill={isDone ? '#00D5D0' : isActive ? labelColor : '#4B556360'}
                  fontSize="7.5" fontWeight="500" fontFamily="Ubuntu, sans-serif">
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
