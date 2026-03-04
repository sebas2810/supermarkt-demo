import { useEffect, useRef, useState } from 'react'
import { useWorkflow } from '../../context/WorkflowContext'

const LOG_COLORS = {
  autonomous: 'text-risk-green',
  escalated: 'text-risk-amber',
}

export default function MiniExecutionTrace() {
  const { cumulativeLog } = useWorkflow()
  const [visibleCount, setVisibleCount] = useState(0)
  const scrollRef = useRef(null)
  const prevLengthRef = useRef(0)

  // Animate new entries appearing when log grows
  useEffect(() => {
    const targetLen = cumulativeLog.length
    if (targetLen <= prevLengthRef.current) {
      prevLengthRef.current = targetLen
      setVisibleCount(targetLen)
      return
    }

    // Start from previous visible count and animate up — fast to stay in sync with graph
    let count = prevLengthRef.current
    const interval = setInterval(() => {
      count++
      if (count >= targetLen) {
        clearInterval(interval)
        setVisibleCount(targetLen)
        prevLengthRef.current = targetLen
        return
      }
      setVisibleCount(count)
    }, 120)
    return () => clearInterval(interval)
  }, [cumulativeLog.length])

  // Auto-scroll to latest entry
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [visibleCount])

  if (cumulativeLog.length === 0) return null

  return (
    <div className="flex-none px-3 py-1 bg-[#0a0c14]/80 border-b border-navy-mid/20">
      <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        <span className="text-[8px] text-gray-600 uppercase tracking-wider flex-none">Trace</span>
        {cumulativeLog.slice(0, visibleCount).map((entry, i) => {
          const isLatest = i === visibleCount - 1
          return (
            <div key={i} className={`flex items-center gap-1.5 flex-none ${isLatest ? 'animate-fade-in' : ''}`}>
              <span className="text-[8px] text-gray-600 font-mono">{entry.time}</span>
              <span className={`text-[8px] ${LOG_COLORS[entry.type]}`}>
                {entry.type === 'escalated' ? '⚠' : '✓'}
              </span>
              <span className={`text-[8px] ${LOG_COLORS[entry.type]} max-w-[220px] truncate ${isLatest ? 'text-white' : ''}`}>
                {entry.action}
              </span>
            </div>
          )
        })}
        {visibleCount < cumulativeLog.length && (
          <span className="text-[8px] text-cap-cyan animate-pulse flex-none">●</span>
        )}
      </div>
    </div>
  )
}
