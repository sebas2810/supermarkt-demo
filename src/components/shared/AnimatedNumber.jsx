import { useState, useEffect } from 'react'

export default function AnimatedNumber({ value, duration = 1500, decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}
