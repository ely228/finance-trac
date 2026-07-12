function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarPoint(cx, cy, r, startAngle)
  const end = polarPoint(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function layoutSegments(data, gapAngleDeg) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const n = data.length
  const usableDeg = Math.max(0, 360 - gapAngleDeg * n)
  let angle = 0
  return data.map(d => {
    const span = (d.value / total) * usableDeg
    const seg = { ...d, start: angle, end: angle + span }
    angle += span + gapAngleDeg
    return seg
  })
}

export default function DonutChart({
  data, size = 160, thickness = 30, gapPx = 6,
  activeIndex = -1, onSegmentClick, onSegmentHover,
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - thickness / 2 - 6
  let gapDeg = data.length > 1 ? ((thickness + gapPx) / (2 * Math.PI * r)) * 360 : 0
  const maxTotalGapDeg = 300
  if (gapDeg * data.length > maxTotalGapDeg) gapDeg = maxTotalGapDeg / data.length
  const segments = layoutSegments(data, gapDeg)
  const uid = 'dc' + Math.round(r)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        {segments.map((seg, i) => (
          <linearGradient key={i} id={`${uid}-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={seg.color} stopOpacity="0.78" />
            <stop offset="55%" stopColor={seg.color} stopOpacity="1" />
            <stop offset="100%" stopColor={seg.color} stopOpacity="0.88" />
          </linearGradient>
        ))}
        <filter id={`${uid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={thickness * 0.32} />
        </filter>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {segments.map((seg, i) => (
        <path
          key={`glow-${i}`}
          d={arcPath(cx, cy, r, seg.start, seg.end)}
          fill="none"
          stroke={seg.color}
          strokeWidth={thickness + 8}
          strokeLinecap="round"
          opacity={activeIndex === i ? 0.5 : 0.28}
          filter={`url(#${uid}-soft)`}
        />
      ))}

      {segments.map((seg, i) => (
        <path
          key={`rim-${i}`}
          d={arcPath(cx, cy, r, seg.start, seg.end)}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={thickness + 2.4}
          strokeLinecap="round"
        />
      ))}

      {segments.map((seg, i) => (
        <path
          key={`main-${i}`}
          d={arcPath(cx, cy, r, seg.start, seg.end)}
          fill="none"
          stroke={`url(#${uid}-grad-${i})`}
          strokeWidth={activeIndex === i ? thickness + 5 : thickness}
          strokeLinecap="round"
          filter={activeIndex === i ? `url(#${uid}-glow)` : undefined}
          style={{ cursor: onSegmentClick ? 'pointer' : 'default', transition: 'stroke-width 380ms cubic-bezier(.34,1.56,.64,1)' }}
          onClick={() => onSegmentClick && onSegmentClick(i)}
          onMouseEnter={() => onSegmentHover && onSegmentHover(i)}
        />
      ))}

      {segments.map((seg, i) => {
        const mid = (seg.start + seg.end) / 2
        const glossStart = seg.start + (seg.end - seg.start) * 0.08
        const glossEnd = seg.start + (seg.end - seg.start) * 0.5
        return (
          <path
            key={`gloss-${i}`}
            d={arcPath(cx, cy, r + thickness * 0.22, Math.min(glossStart, mid), Math.max(glossEnd, seg.start + 1))}
            fill="none"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={thickness * 0.24}
            strokeLinecap="round"
            style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
          />
        )
      })}
    </svg>
  )
}
