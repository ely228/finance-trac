import { useEffect, useRef, useState } from 'react'

const spring = t => 1 - Math.pow(1 - t, 3) // ease-out cubic, feels close to a gentle spring settle

/**
 * Animates a numeric value from its previous value to the new one whenever
 * it changes, instead of snapping instantly. Renders already-formatted text
 * via the `format` callback so callers keep full control of currency/locale.
 */
export default function AnimatedNumber({ value, format, duration = 550, className }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = spring(t)
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span className={className}>{format(display)}</span>
}
