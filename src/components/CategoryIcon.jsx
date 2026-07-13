import React from 'react'

const iconPaths = {
  shopping: (
    <>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </>
  ),
  food: (
    <>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </>
  ),
  transport: (
    <>
      <rect x="1" y="3" width="22" height="13" rx="2" />
      <path d="M4 21v-5M20 21v-5M1 10h22" />
    </>
  ),
  home: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  health: (
    <>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </>
  ),
  fun: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" />
    </>
  ),
  education: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  sport: (
    <>
      <rect x="2" y="8" width="3" height="8" rx="1" />
      <rect x="19" y="8" width="3" height="8" rx="1" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" />
      <rect x="5" y="10" width="2" height="4" rx="0.5" />
      <rect x="17" y="10" width="2" height="4" rx="0.5" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <line x1="3" y1="13" x2="21" y2="13" />
      <path d="M12 8a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </>
  ),
  salary: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="12" cy="14" r="2" />
    </>
  ),
  phone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" />
    </>
  ),
  other: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <rect x="14" y="10" width="8" height="6" rx="1" />
    </>
  ),
}

export function categoryMeta(name = '') {
  const normalized = name.toLowerCase()
  if (/еда|ресторан|кафе|продукты|кофе|пицца|food|rest/.test(normalized)) {
    return { icon: 'food', description: 'Рестораны, продукты, кафе', tone: 'pink', bg: 'rgba(247, 141, 197, 0.12)', fg: '#EC5DA6' }
  }
  if (/такси|транспорт|transport|авто|машина|бензин/.test(normalized)) {
    return { icon: 'transport', description: 'Транспорт и авто', tone: 'orange', bg: 'rgba(217, 130, 46, 0.12)', fg: '#D9822E' }
  }
  if (/дом|жиль|аренда|коммунал|квартира|home/.test(normalized)) {
    return { icon: 'home', description: 'Жильё и ремонт', tone: 'green', bg: 'rgba(55, 184, 145, 0.12)', fg: '#37B891' }
  }
  if (/здоров|аптек|медиц|врач|лекарств/.test(normalized)) {
    return { icon: 'health', description: 'Медицина и здоровье', tone: 'violet', bg: 'rgba(184, 154, 244, 0.12)', fg: '#8865E8' }
  }
  if (/развлеч|кино|игр|развлечения|хобби|театр|концерт|fun/.test(normalized)) {
    return { icon: 'fun', description: 'Развлечения и досуг', tone: 'pink', bg: 'rgba(247, 141, 197, 0.12)', fg: '#EC5DA6' }
  }
  if (/образов|курс|книг|учеба|обучение/.test(normalized)) {
    return { icon: 'education', description: 'Образование и книги', tone: 'teal', bg: 'rgba(145, 224, 204, 0.12)', fg: '#37B891' }
  }
  if (/спорт|фитнес|зал|трениров|бассейн/.test(normalized)) {
    return { icon: 'sport', description: 'Спорт и тренировки', tone: 'blue', bg: 'rgba(88, 174, 229, 0.12)', fg: '#58AEE5' }
  }
  if (/подарок|подарки|праздник/.test(normalized)) {
    return { icon: 'gift', description: 'Подарки и праздники', tone: 'pink', bg: 'rgba(247, 141, 197, 0.12)', fg: '#EC5DA6' }
  }
  if (/зарплата|доход|работа|аванс|начисления|salary/.test(normalized)) {
    return { icon: 'salary', description: 'Доходы и начисления', tone: 'green', bg: 'rgba(79, 174, 140, 0.12)', fg: '#4FAE8C' }
  }
  if (/связь|интернет|телефон|мобильный/.test(normalized)) {
    return { icon: 'phone', description: 'Связь и интернет', tone: 'muted', bg: 'rgba(133, 128, 154, 0.12)', fg: '#85809A' }
  }
  if (/проч|other|разное/.test(normalized)) {
    return { icon: 'other', description: 'Разные расходы', tone: 'muted', bg: 'rgba(133, 128, 154, 0.12)', fg: '#85809A' }
  }
  // Default shopping icon
  return { icon: 'shopping', description: 'Покупки и одежда', tone: 'violet', bg: 'rgba(184, 154, 244, 0.12)', fg: '#8865E8' }
}

export default function CategoryIcon({ name, type = 'category' }) {
  const key = type === 'wallet' ? 'wallet' : categoryMeta(name).icon
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {iconPaths[key] || iconPaths.shopping}
    </svg>
  )
}
