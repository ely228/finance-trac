import { useEffect, useRef, useState } from 'react'

const icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V10" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19H2" />
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.6 12.4 12.6 3H5a2 2 0 0 0-2 2v7.6l9.4 9.4a1.5 1.5 0 0 0 2 0l6.2-6.2a1.5 1.5 0 0 0 0-2Z" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const items = [
  { key: 'home', label: 'Главная', icon: icons.home },
  { key: 'dashboard', label: 'Дашборд', icon: icons.chart },
  { key: 'categories', label: 'Категории', icon: icons.tag },
]

export default function Nav({ tab, setTab }) {
  const [scrolled, setScrolled] = useState(false)
  const trackRef = useRef(null)
  const btnRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function measure() {
      const i = items.findIndex(it => it.key === tab)
      const btn = btnRefs.current[i]
      const track = trackRef.current
      if (!btn || !track) return
      const b = btn.getBoundingClientRect()
      const t = track.getBoundingClientRect()
      setIndicator({ left: b.left - t.left, top: b.top - t.top, width: b.width, height: b.height })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [tab])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
      <div className="brand" />
      <div className="nav-track" ref={trackRef}>
        <div
          className="nav-indicator"
          style={{ transform: `translate(${indicator.left}px, ${indicator.top}px)`, width: indicator.width, height: indicator.height }}
        />
        {items.map((it, i) => (
          <button
            key={it.key}
            ref={el => (btnRefs.current[i] = el)}
            className={tab === it.key ? 'active' : ''}
            onClick={() => setTab(it.key)}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
