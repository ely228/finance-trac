import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { categoryMeta } from './CategoryIcon'

const ICON_SVGS = {
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
  wallet: (
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
  ),
  transfer: (
    <>
      <path d="M17 3L21 7L17 11" />
      <path d="M3 7H21" />
      <path d="M7 21L3 17L7 13" />
      <path d="M21 17H3" />
    </>
  )
}

function CategoryContourIcon({ name, size = 24, strokeWidth = 1.8, style }) {
  const content = ICON_SVGS[name] || ICON_SVGS.bag
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', ...style }}
    >
      {content}
    </svg>
  )
}

const EXPENSE_ICONS = [
  'bag', 'burger', 'car', 'house',
  'heart', 'gamepad', 'airplane', 'more'
]

const INCOME_ICONS = [
  'wallet', 'transfer', 'more'
]

const PALETTE_COLORS = [
  { rgb: '240, 168, 192', hex: '#F0A8C0', name: 'Светло-розовый' },
  { rgb: '226, 149, 203', hex: '#E295CB', name: 'Розово-лавандовый' },
  { rgb: '202, 137, 215', hex: '#CA89D7', name: 'Нежно-лавандовый' },
  { rgb: '172, 122, 224', hex: '#AC7AE0', name: 'Лавандовый' },
  { rgb: '144, 107, 230', hex: '#906BE6', name: 'Фиолетовый' },
  { rgb: '124, 87, 218', hex: '#7C57DA', name: 'Насыщенный фиолетовый' }
]

export default function EditCategorySheet({ category, onSaved, onClose }) {
  const [name, setName] = useState(category ? category.name : '')
  const [categoryType, setCategoryType] = useState(category && category.type ? category.type : 'expense')
  const [selectedIcon, setSelectedIcon] = useState(category && category.icon ? category.icon : EXPENSE_ICONS[0])
  
  // Find matching initial color swatch
  const initialColor = PALETTE_COLORS.find(c => c.rgb === (category && category.color)) || PALETTE_COLORS[0]
  const [selectedColor, setSelectedColor] = useState(initialColor)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (category) {
      setName(category.name)
      setCategoryType(category.type || 'expense')
      if (category.icon) setSelectedIcon(category.icon)
      const matchingColor = PALETTE_COLORS.find(c => c.rgb === category.color)
      if (matchingColor) setSelectedColor(matchingColor)
    }
  }, [category])

  const handleTypeChange = (newType) => {
    setCategoryType(newType)
    if (newType === 'expense') {
      setSelectedIcon(EXPENSE_ICONS[0])
    } else {
      setSelectedIcon(INCOME_ICONS[0])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return

    setSaving(true)
    const { error: err } = await supabase
      .from('categories')
      .update({
        name: trimmed,
        icon: selectedIcon,
        color: selectedColor.rgb,
        type: categoryType
      })
      .eq('id', category.id)
    setSaving(false)

    if (err) {
      setError(err.code === '23505' ? 'Такая категория уже есть' : err.message)
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" />
        
        <h2 className="modal-title">
          Редактирование категории
        </h2>

        <form className="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Category Type Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px' }}>
              Тип категории
            </label>
            <div className="type-toggle-segment" style={{
              display: 'flex',
              background: '#F5F6FA',
              borderRadius: '14px',
              border: '1px solid var(--hairline)',
              overflow: 'hidden',
              padding: '2px',
              marginBottom: '4px'
            }}>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  background: categoryType === 'expense' ? '#FFFFFF' : 'transparent',
                  borderRadius: '12px',
                  padding: '10px 4px',
                  cursor: 'pointer',
                  borderRight: '1px solid var(--hairline)',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: categoryType === 'expense' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC5DA6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: categoryType === 'expense' ? '#EC5DA6' : 'var(--ink-soft)' }}>Расход</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  background: categoryType === 'income' ? '#FFFFFF' : 'transparent',
                  borderRadius: '12px',
                  padding: '10px 4px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: categoryType === 'income' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#37B891" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: categoryType === 'income' ? '#37B891' : 'var(--ink-soft)' }}>Доход</span>
              </button>
            </div>
          </div>

          {/* Big Center Preview Circle */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: `rgba(${selectedColor.rgb}, 0.1)`,
                color: selectedColor.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2.2px solid ${selectedColor.hex}`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <CategoryContourIcon name={selectedIcon} size={38} strokeWidth={2.0} />
            </div>
          </div>

          {/* Name Input Field */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px' }}>
              Название категории
            </label>
            <div className="form-field-group" style={{ marginBottom: '0px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  background: `rgba(${selectedColor.rgb}, 0.12)`,
                  color: selectedColor.hex,
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}
              >
                <CategoryContourIcon name={selectedIcon} size={22} strokeWidth={1.8} />
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Введите название"
                required
                style={{
                  flex: 1,
                  height: '52px',
                  borderRadius: '16px',
                  border: '1px solid var(--hairline)',
                  padding: '0 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: 'var(--ink)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          </div>

          {/* Choose Icon Grid */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px' }}>
              Выберите иконку
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '4px'
              }}
            >
              {(categoryType === 'expense' ? EXPENSE_ICONS : INCOME_ICONS).map(ic => {
                const isSelected = selectedIcon === ic
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    style={{
                      height: '52px',
                      border: isSelected ? `2.2px solid ${selectedColor.hex}` : '1.5px solid var(--hairline)',
                      background: isSelected ? `rgba(${selectedColor.rgb}, 0.05)` : '#FFFFFF',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? selectedColor.hex : 'var(--ink-soft)',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
                    }}
                  >
                    <CategoryContourIcon name={ic} size={22} strokeWidth={1.8} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Choose Color Swatches */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px' }}>
              Выберите цвет
            </label>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                padding: '6px 4px 10px',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {PALETTE_COLORS.map(colorOption => {
                const isSelected = selectedColor.rgb === colorOption.rgb
                return (
                  <button
                    key={colorOption.rgb}
                    type="button"
                    onClick={() => setSelectedColor(colorOption)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: colorOption.hex,
                      border: isSelected ? `3px solid #FFFFFF` : '1px solid rgba(0,0,0,0.05)',
                      outline: isSelected ? `2.2px solid ${colorOption.hex}` : 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title={colorOption.name}
                    aria-label={colorOption.name}
                  />
                )
              })}
            </div>
          </div>

          {/* Preview Row */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px' }}>
              Предпросмотр
            </label>
            <div className="card" style={{ padding: '16px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--hairline)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div className="cat-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none', padding: 0 }}>
                <div
                  className="cat-avatar"
                  style={{
                    background: `rgba(${selectedColor.rgb}, 0.16)`,
                    color: selectedColor.hex,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CategoryContourIcon name={selectedIcon} size={18} strokeWidth={1.8} />
                </div>
                <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                    {name || 'Название категории'}
                  </div>
                  <div className="cat-sub" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    {categoryMeta(name).description}
                  </div>
                  <div className="cat-progress">
                    <div className="cat-progress-fill" style={{ width: '0%', background: selectedColor.hex }} />
                  </div>
                </div>
                <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="cat-amount" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>0,00 ₽</div>
                  <div className="cat-pct" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>0%</div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error" style={{ color: 'var(--expense)', fontSize: '13.5px', fontWeight: 600, textAlign: 'center', margin: '8px 0' }}>{error}</div>}

          {/* Submit button with requested copy: "Сохранить изменения" */}
          <button
            type="submit"
            className="submit-btn"
            disabled={saving || !name.trim()}
            style={{
              height: '52px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(90deg, #6D5BF0 0%, #C062E8 100%)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '12px',
              opacity: saving || !name.trim() ? 0.5 : 1,
              pointerEvents: saving || !name.trim() ? 'none' : 'auto',
              boxShadow: '0 6px 16px rgba(140, 80, 220, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? 'Сохранение…' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  )
}
