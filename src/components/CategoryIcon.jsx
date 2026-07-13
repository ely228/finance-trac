import React from 'react'

const iconPaths = {
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
}

// Helper to get description for categorizations. We'll derive colors from categoryStyle in utils.js to stay fully uniform.
import { categoryStyle } from '../utils'

export function categoryMeta(name = '') {
  const normalized = name.toLowerCase()
  const style = categoryStyle(name)
  let desc = 'Покупки и одежда'

  if (/еда|ресторан|кафе|продукты|кофе|пицца|food|rest/.test(normalized)) {
    desc = 'Рестораны, продукты, кафе'
  } else if (/такси|транспорт|transport|авто|машина|бензин/.test(normalized)) {
    desc = 'Транспорт и авто'
  } else if (/дом|жиль|аренда|коммунал|квартира|home/.test(normalized)) {
    desc = 'Жильё и ремонт'
  } else if (/здоров|аптек|медиц|врач|лекарств/.test(normalized)) {
    desc = 'Медицина и здоровье'
  } else if (/развлеч|кино|игр|развлечения|хобби|театр|концерт|fun/.test(normalized)) {
    desc = 'Развлечения и досуг'
  } else if (/образов|курс|книг|учеба|обучение/.test(normalized)) {
    desc = 'Образование и книги'
  } else if (/спорт|фитнес|зал|трениров|бассейн/.test(normalized)) {
    desc = 'Спорт и тренировки'
  } else if (/подарок|подарки|праздник/.test(normalized)) {
    desc = 'Подарки и праздники'
  } else if (/зарплата|доход|работа|аванс|начисления|salary/.test(normalized)) {
    desc = 'Доходы и начисления'
  } else if (/связь|интернет|телефон|мобильный/.test(normalized)) {
    desc = 'Связь и интернет'
  } else if (/проч|other|разное/.test(normalized)) {
    desc = 'Разные расходы'
  }

  return { icon: 'shopping', description: desc, tone: 'pink', bg: style.bg, fg: style.fg }
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
