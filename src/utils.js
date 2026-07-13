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

// Constrain palette to strictly: светло-розовый -> нежно-лавандовый -> насыщенный фиолетовый.
// Base colors: #F0A8C0 (светло-розовый) and #7C57DA (насыщенный фиолетовый).
// 6 intermediate tones / shades in this range.
const CATEGORY_PALETTE = [
  { bg: 'rgba(240, 168, 192, 0.16)', fg: '#F0A8C0' }, // светло-розовый
  { bg: 'rgba(226, 149, 203, 0.16)', fg: '#E295CB' }, // нежно-розово-лавандовый
  { bg: 'rgba(202, 137, 215, 0.16)', fg: '#CA89D7' }, // нежно-лавандовый
  { bg: 'rgba(172, 122, 224, 0.16)', fg: '#AC7AE0' }, // лавандовый
  { bg: 'rgba(144, 107, 230, 0.16)', fg: '#906BE6' }, // умеренно-фиолетовый
  { bg: 'rgba(124, 87, 218, 0.16)',  fg: '#7C57DA' }, // насыщенный фиолетовый
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
