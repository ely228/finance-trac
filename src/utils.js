export function todayISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function currentMonthKey() {
  return todayISO().slice(0, 7)
}

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

export function daysInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + ' ₽'
}

export function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const CATEGORY_PALETTE = [
  { bg: 'rgba(156,135,214,0.16)', fg: '#9C87D6' },
  { bg: 'rgba(232,136,172,0.16)', fg: '#E8659E' },
  { bg: 'rgba(243,175,119,0.18)', fg: '#D9822E' },
  { bg: 'rgba(111,191,166,0.18)', fg: '#3F9C7E' },
  { bg: 'rgba(130,169,214,0.18)', fg: '#5586BE' },
  { bg: 'rgba(216,154,203,0.18)', fg: '#BD5FA6' },
  { bg: 'rgba(224,177,92,0.20)', fg: '#B8862A' },
  { bg: 'rgba(143,195,201,0.20)', fg: '#3E8C96' },
]

function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function categoryStyle(name) {
  const idx = hashString(name || '') % CATEGORY_PALETTE.length
  return CATEGORY_PALETTE[idx]
}

export function categoryInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

export function formatPercent(v) {
  return `${v >= 0 ? '' : '−'}${Math.abs(Math.round(v))}%`
}
