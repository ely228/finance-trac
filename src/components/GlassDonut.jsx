import { useId } from 'react'

const toPoint = (cx, cy, radius, angle) => {
  const radians = (angle - 90) * Math.PI / 180
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)]
}

function arcPath(cx, cy, radius, start, end) {
  const [x1, y1] = toPoint(cx, cy, radius, start)
  const [x2, y2] = toPoint(cx, cy, radius, end)
  const largeArc = end - start > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
}

export default function GlassDonut({ data, value, label = 'расходы', size = 168, compact = false }) {
  const uid = useId().replace(/:/g, '')
  const slices = data.slice(0, 3)
  const total = slices.reduce((sum, item) => sum + Number(item.value), 0) || 1
  const gap = 5
  let angle = 0

  return (
    <div className={`glass-donut-illustration${compact ? ' compact' : ''}`} style={{ '--donut-size': `${size}px` }}>
      <svg viewBox="0 0 200 200" role="img" aria-label={label}>
        <defs>
          <filter id={`${uid}-glow`} x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id={`${uid}-soft`} x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="2.2" /></filter>
          {slices.map((slice, index) => <linearGradient id={`${uid}-gradient-${index}`} key={slice.name} x1="15%" y1="5%" x2="88%" y2="94%"><stop offset="0%" stopColor="#fff" stopOpacity=".7" /><stop offset="20%" stopColor={slice.color} /><stop offset="100%" stopColor={slice.color} stopOpacity=".82" /></linearGradient>)}
        </defs>
        {slices.map((slice, index) => {
          const sweep = Math.max(0, Number(slice.value) / total * (360 - gap * slices.length))
          const start = angle + gap / 2
          const end = start + sweep
          angle += sweep + gap
          const d = arcPath(100, 100, 72, start, end)
          return <g key={slice.name}>
            <path d={d} fill="none" stroke={slice.color} strokeOpacity=".36" strokeWidth="34" strokeLinecap="round" filter={`url(#${uid}-soft)`} />
            <path d={d} fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="32" strokeLinecap="round" />
            <path d={d} fill="none" stroke={`url(#${uid}-gradient-${index})`} strokeWidth="27" strokeLinecap="round" filter={`url(#${uid}-glow)`} />
            <path d={d} fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        })}
      </svg>
      <div className="glass-donut-copy"><strong>{value}</strong><span>{label}</span></div>
    </div>
  )
}
