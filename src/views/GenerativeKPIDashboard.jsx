import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { generateDashboard, queryDashboard, getFallbackDashboard } from '../lib/claude'
import { ThinkingDots } from '../components/shared/TypewriterText'
import { useWorkflowSafe } from '../context/WorkflowContext'
import brands from '../data/brands.json'
import useCases from '../data/use_cases.json'

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const STATUS_COLORS = {
  healthy: 'border-risk-green/30 bg-risk-green/5',
  degraded: 'border-risk-amber/30 bg-risk-amber/5',
  alert: 'border-risk-red/30 bg-risk-red/5',
}

export default function GenerativeKPIDashboard({ navigateTo }) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [query, setQuery] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)
  const [responses, setResponses] = useState([])
  const queryRef = useRef(null)

  // Read workflow completion state from context
  const { workflowCompleted } = useWorkflowSafe()

  // Load dashboard on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const result = await generateDashboard()
      if (cancelled) return
      if (result) {
        setDashboard(result)
        setIsFallback(false)
      } else {
        setDashboard(getFallbackDashboard())
        setIsFallback(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleQuery = async () => {
    if (!query.trim() || queryLoading) return
    const q = query.trim()
    setQuery('')
    setQueryLoading(true)

    const result = await queryDashboard(q)
    setQueryLoading(false)

    if (result) {
      setResponses(prev => [{ question: q, ...result }, ...prev])
    } else {
      setResponses(prev => [{
        question: q,
        answer: "I'm unable to connect to the Claude API right now. This is a demo — in production, I'd analyse the operational data and provide a data-driven answer.",
        relatedMetrics: [],
      }, ...prev])
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-cap-cyan/10 border border-cap-cyan/30 flex items-center justify-center mx-auto mb-4">
            <ThinkingDots />
          </div>
          <p className="text-sm text-gray-300 mb-1">Claude is analysing operational data</p>
          <p className="text-[10px] text-gray-500">{brands.length} brands · {useCases.length} use cases · Generating dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Dashboard content */}
      <div className="flex-1 min-h-0 overflow-auto p-5 space-y-4">
        {/* Fallback banner */}
        {isFallback && (
          <div className="bg-risk-amber/5 border border-risk-amber/20 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-risk-amber flex-none" />
            <span className="text-risk-amber">Demo mode — Claude API not connected. Showing pre-computed dashboard.</span>
          </div>
        )}

        {/* Workflow completion banner */}
        {workflowCompleted && (
          <div className="animate-section-appear" style={{ animationDelay: '0ms' }}>
            <div className="bg-risk-green/5 border border-risk-green/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-risk-green/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-risk-green" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-risk-green">Workflow Completed — SC-2025-4421-BKT</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Cold chain breach resolved — 2,800 units saved, €4,172 revenue recovered at Albert Heijn
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <span className="text-sm font-bold text-risk-green">82%</span>
                    <p className="text-[8px] text-gray-500">Waste avoided</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-cap-cyan">84min</span>
                    <p className="text-[8px] text-gray-500">Detection → action</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-white">91%</span>
                    <p className="text-[8px] text-gray-500">Model confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="animate-section-appear" style={{ animationDelay: workflowCompleted ? '150ms' : '0ms' }}>
          <div className="bg-navy-light rounded-xl border border-navy-mid p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cap-cyan" />
              <span className="text-[10px] text-cap-cyan font-semibold uppercase tracking-wider">AI Executive Summary</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{dashboard.headline}</p>
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="animate-section-appear" style={{ animationDelay: '150ms' }}>
          <h3 className="text-xs font-semibold text-gray-300 mb-2">Brand Performance</h3>
          <div className="grid grid-cols-3 gap-3">
            {dashboard.brandBreakdown?.map((brand, i) => {
              const TrendIcon = TREND_ICONS[brand.trend] || Minus
              const brandData = brands.find(b => b.name === brand.brand)
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 cursor-pointer hover:bg-navy-mid/20 transition-all ${STATUS_COLORS[brand.status] || 'border-navy-mid bg-navy-light'}`}
                  onClick={() => {
                    if (brandData) navigateTo('brand', { brandId: brandData.id, label: brandData.name })
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {brandData && (
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: brandData.logoColor }}
                        >
                          {brandData.shortName}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-white">{brand.brand}</span>
                    </div>
                    <TrendIcon className={`w-3.5 h-3.5 ${
                      brand.trend === 'up' ? 'text-risk-green' : brand.trend === 'down' ? 'text-risk-red' : 'text-gray-500'
                    }`} />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{brand.highlight}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Comparison */}
        {dashboard.weeklyComparison && (
          <div className="animate-section-appear" style={{ animationDelay: '300ms' }}>
            <div className="bg-navy-light rounded-xl border border-navy-mid p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-2">Week-on-Week</h3>
              <p className="text-xs text-gray-400 mb-2">{dashboard.weeklyComparison.summary}</p>
              <div className="space-y-1">
                {dashboard.weeklyComparison.highlights?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-cap-cyan flex-none mt-0.5">{'\u2022'}</span>
                    <span className="text-gray-300">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Outliers */}
        {dashboard.outliers?.length > 0 && (
          <div className="animate-section-appear" style={{ animationDelay: '450ms' }}>
            <h3 className="text-xs font-semibold text-gray-300 mb-2">Attention Required</h3>
            <div className="space-y-2">
              {dashboard.outliers.map((outlier, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 ${
                    outlier.severity === 'red'
                      ? 'border-risk-red/30 bg-risk-red/5'
                      : 'border-risk-amber/30 bg-risk-amber/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-3.5 h-3.5 ${outlier.severity === 'red' ? 'text-risk-red' : 'text-risk-amber'}`} />
                    <span className="text-xs font-semibold text-white">{outlier.brand}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{outlier.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projection */}
        {dashboard.projection && (
          <div className="animate-section-appear" style={{ animationDelay: '600ms' }}>
            <div className="bg-cap-cyan/5 border border-cap-cyan/20 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-cap-cyan mb-1">Forward Projection</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{dashboard.projection}</p>
            </div>
          </div>
        )}

        {/* Query responses */}
        {responses.map((resp, i) => (
          <div key={i} className="animate-slide-in">
            <div className="bg-navy-light rounded-xl border border-cap-cyan/20 p-4">
              <p className="text-[10px] text-cap-cyan mb-2">Q: {resp.question}</p>
              <p className="text-xs text-gray-200 leading-relaxed mb-2">{resp.answer}</p>
              {resp.relatedMetrics?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resp.relatedMetrics.map((m, j) => (
                    <div key={j} className="bg-navy/50 rounded-lg px-2.5 py-1">
                      <span className="text-[9px] text-gray-500">{m.name}</span>
                      <span className="text-[11px] text-white font-bold ml-1.5">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Query bar — pinned bottom */}
      <div className="flex-none border-t border-navy-mid/30 bg-navy-light px-5 py-3">
        {queryLoading && (
          <div className="flex items-center gap-2 mb-2 text-xs text-cap-cyan">
            <ThinkingDots />
            <span>Analysing...</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={queryRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuery()}
              placeholder="Ask about your supply chain operations..."
              className="w-full bg-navy border border-navy-mid rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cap-cyan/40 transition-colors"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={!query.trim() || queryLoading}
            className="p-2.5 bg-cap-cyan text-navy rounded-lg hover:bg-cap-cyan/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
