import { useState, useEffect, useRef } from 'react'

export function TypewriterText({ text, speed = 15, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      indexRef.current++
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) { clearInterval(interval); onComplete?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="inline-block w-0.5 h-4 bg-cap-cyan ml-0.5 animate-pulse" />}
    </span>
  )
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-cap-cyan" style={{ animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}
