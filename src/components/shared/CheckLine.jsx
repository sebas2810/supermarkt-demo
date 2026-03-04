import { useState, useEffect } from 'react'

export default function CheckLine({ check, delay, visible }) {
  const [state, setState] = useState('hidden')
  useEffect(() => {
    if (!visible) return
    const t1 = setTimeout(() => setState('checking'), delay)
    const t2 = setTimeout(() => setState('done'), delay + 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible, delay])

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
      state === 'hidden' ? 'opacity-0 translate-x-4' :
      state === 'checking' ? 'opacity-100 bg-cap-light-blue/5 border border-cap-light-blue/20' :
      'opacity-100 bg-risk-green/5 border border-risk-green/20'
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
        state === 'checking' ? 'bg-cap-light-blue/20 text-cap-light-blue animate-pulse' :
        state === 'done' ? 'bg-risk-green/20 text-risk-green' :
        'bg-navy-mid text-gray-500'
      }`}>
        {state === 'done' ? '\u2713' : state === 'checking' ? '\u2026' : '\u2014'}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white">{check.check}</span>
        <span className="text-[10px] text-gray-500 ml-1">
          {state === 'done' ? check.actual : ''}
        </span>
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-opacity duration-300 ${
        state === 'done' ? 'opacity-100 bg-risk-green/20 text-risk-green' : 'opacity-0'
      }`}>
        {check.status}
      </span>
    </div>
  )
}
