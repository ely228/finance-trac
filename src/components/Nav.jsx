import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
      <div className="brand" />
      {items.map(it => (
        <button key={it.key} className={tab === it.key ? 'active' : ''} onClick={() => setTab(it.key)}>
          {it.icon}
          <span>{it.label}</span>
          <span className="nav-dot" />
        </button>
      ))}
    </nav>
  )
}
