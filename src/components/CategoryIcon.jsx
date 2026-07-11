const iconPaths = {
  shopping: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /><path d="M9 13h.01M15 13h.01" /></>,
  food: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" /><path d="M16 3v18M16 3c3 2 3 7 0 9" /></>,
  transport: <><path d="M5 16V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v9" /><path d="M3 16h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3ZM7 16v-5h10v5" /><circle cx="7" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
  home: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  health: <><path d="M12 5v14M5 12h14" /></>,
  fun: <><path d="M5 5h14v14H5z" /><path d="M8 13s1.2 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
  education: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c2.8 2 7.2 2 10 0v-5M21 9v6" /></>,
  other: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  wallet: <><path d="M4 7a3 3 0 0 1 3-3h10v16H7a3 3 0 0 1-3-3V7Z" /><path d="M4 8h15a2 2 0 0 1 2 2v5h-5a2 2 0 0 1 0-4h5" /></>,
}

export function categoryMeta(name = '') {
  const normalized = name.toLowerCase()
  if (/еда|ресторан|кафе|food/.test(normalized)) return { icon: 'food', description: 'Рестораны и кафе', tone: 'pink' }
  if (/такси|транспорт|transport|авто/.test(normalized)) return { icon: 'transport', description: 'Транспорт', tone: 'orange' }
  if (/дом|жиль|home/.test(normalized)) return { icon: 'home', description: 'Жильё', tone: 'green' }
  if (/здоров|аптек|медиц/.test(normalized)) return { icon: 'health', description: 'Аптеки и медицина', tone: 'violet' }
  if (/развлеч|кино|игр/.test(normalized)) return { icon: 'fun', description: 'Кино, игры, хобби', tone: 'pink' }
  if (/образов|курс|книг/.test(normalized)) return { icon: 'education', description: 'Курсы и книги', tone: 'teal' }
  if (/проч|other/.test(normalized)) return { icon: 'other', description: 'Прочие расходы', tone: 'muted' }
  return { icon: 'shopping', description: 'Покупки', tone: 'violet' }
}

export default function CategoryIcon({ name, type = 'category' }) {
  const key = type === 'wallet' ? 'wallet' : categoryMeta(name).icon
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[key]}</svg>
}
