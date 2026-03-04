import { useState, useEffect } from 'react'

export default function KPICard({ kpi, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300 + index * 120)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div className={`bg-navy-light rounded-xl border border-navy-mid p-2.5 transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <h4 className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider leading-tight" style={{ minHeight: '24px' }}>{kpi.name}</h4>
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <div className="bg-navy/50 rounded-lg p-1.5 text-center">
          <span className="text-[8px] text-gray-500 uppercase block">Before</span>
          <span className="text-sm font-bold text-gray-400">{kpi.before}</span>
        </div>
        <div className="bg-risk-green/5 border border-risk-green/20 rounded-lg p-1.5 text-center">
          <span className="text-[8px] text-gray-500 uppercase block">After</span>
          <span className="text-sm font-bold text-white">{kpi.after}</span>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-risk-green bg-risk-green/10">
          {kpi.change_label}
        </span>
      </div>
    </div>
  )
}
