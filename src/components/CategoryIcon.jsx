import React from 'react'
import { categoryStyle } from '../utils'

const iconPaths = {
  // Existing system icons
  shopping: (
    <>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <rect x="14" y="10" width="8" height="6" rx="1" />
    </>
  ),

  // Our 12 new contour preset icons
  bag: (
    <>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  burger: (
    <>
      <path d="M4 11h16" />
      <path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z" />
      <path d="M4 11a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4" />
      <path d="M4 18a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1H4v1z" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
      <path d="M6 16v2" />
      <path d="M18 16v2" />
    </>
  ),
  house: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  heart: (
    <>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </>
  ),
  gamepad: (
    <>
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="3" />
    </>
  ),
  airplane: (
    <>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.6.3-1.6 1.2l-.2 1.4c0 .3.2.7.4.9l5.1 3.1-3.5 3.5-2-.5c-.4-.1-.8.1-1 .4l-.7.8c-.2.3-.2.7.1.9l3.5 2 2 3.5c.2.3.6.3.9.1l.8-.7c.3-.2.4-.6.4-1l-.5-2 3.5-3.5 3.1 5.1c.2.2.6.4.9.4l1.4-.2c.9 0 1.4-.7 1.2-1.6z" />
    </>
  ),
  wallet_contour: (
    <>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <rect x="14" y="10" width="8" height="6" rx="1" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  paw: (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="9" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M12 10c-2.2 0-4 1.8-4 4 0 1.5 1 2.8 2.5 3.5h3c1.5-.7 2.5-2 2.5-3.5 0-2.2-1.8-4-4-4z" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </>
  )
}

export function categoryMeta(name = '') {
  const normalized = name.toLowerCase()
  const style = categoryStyle(name)
  let desc = 'Покупки и одежда'

  if (/еда|ресторан|кафе|продукты|кофе|пицца|food|rest|burger/.test(normalized)) {
    desc = 'Рестораны, продукты, кафе'
  } else if (/такси|транспорт|transport|авто|машина|бензин|car|bus/.test(normalized)) {
    desc = 'Транспорт и авто'
  } else if (/дом|жиль|аренда|коммунал|квартира|home|house/.test(normalized)) {
    desc = 'Жильё и ремонт'
  } else if (/здоров|аптек|медиц|врач|лекарств/.test(normalized)) {
    desc = 'Медицина и здоровье'
  } else if (/развлеч|кино|игр|развлечения|хобби|театр|концерт|fun|gamepad/.test(normalized)) {
    desc = 'Развлечения и досуг'
  } else if (/образов|курс|книг|учеба|обучение|book/.test(normalized)) {
    desc = 'Образование и книги'
  } else if (/спорт|фитнес|зал|трениров|бассейн/.test(normalized)) {
    desc = 'Спорт и тренировки'
  } else if (/подарок|подарки|праздник/.test(normalized)) {
    desc = 'Подарки и праздники'
  } else if (/зарплата|доход|работа|аванс|начисления|salary/.test(normalized)) {
    desc = 'Доходы и начисления'
  } else if (/связь|интернет|телефон|мобильный/.test(normalized)) {
    desc = 'Связь и интернет'
  } else if (/проч|other|разное|more/.test(normalized)) {
    desc = 'Разные расходы'
  }

  // Map known icon keys to the meta data icon key
  let iconKey = 'shopping'
  if (iconPaths[normalized]) {
    iconKey = normalized
  } else if (normalized === 'wallet') {
    iconKey = 'wallet_contour'
  }

  return { icon: iconKey, description: desc, tone: 'pink', bg: style.bg, fg: style.fg }
}

export default function CategoryIcon({ name, type = 'category' }) {
  let key = type === 'wallet' ? 'wallet' : categoryMeta(name).icon
  if (name && iconPaths[name]) {
    key = name
  } else if (name === 'wallet') {
    key = 'wallet_contour'
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {iconPaths[key] || iconPaths.shopping}
    </svg>
  )
}
