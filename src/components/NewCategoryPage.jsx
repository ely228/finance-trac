import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const PRESET_ICONS = [
  '🛍️', '🍔', '🚗', '🏠', '💊', '⚽', '🎁', '💡',
  '✈️', '👔', '📚', '🍿', '💰', '🛒', '🔌', '💅'
]

const PALETTE_COLORS = [
  { rgb: '240, 168, 192', hex: '#F0A8C0', name: 'Светло-розовый' },
  { rgb: '226, 149, 203', hex: '#E295CB', name: 'Розово-лавандовый' },
  { rgb: '202, 137, 215', hex: '#CA89D7', name: 'Нежно-лавандовый' },
  { rgb: '172, 122, 224', hex: '#AC7AE0', name: 'Лавандовый' },
  { rgb: '144, 107, 230', hex: '#906BE6', name: 'Фиолетовый' },
  { rgb: '124, 87, 218', hex: '#7C57DA', name: 'Насыщенный фиолетовый' }
]

export default function NewCategoryPage({ onBack, onAdded, categoryToEdit = null, isEditing = false }) {
  const [name, setName] = useState(isEditing && categoryToEdit ? categoryToEdit.name : '')
  const [type, setType] = useState(isEditing && categoryToEdit ? (categoryToEdit.type || 'expense') : 'expense')
  const [selectedIcon, setSelectedIcon] = useState(
    isEditing && categoryToEdit && categoryToEdit.icon ? categoryToEdit.icon : PRESET_ICONS[0]
  )
  const [selectedColor, setSelectedColor] = useState(() => {
    if (isEditing && categoryToEdit && categoryToEdit.color) {
      const match = PALETTE_COLORS.find(c => c.rgb === categoryToEdit.color)
      return match || { rgb: categoryToEdit.color, hex: `rgb(${categoryToEdit.color})`, name: 'Текущий цвет' }
    }
    return PALETTE_COLORS[0]
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // If the props change, update state accordingly
  useEffect(() => {
    if (isEditing && categoryToEdit) {
      setName(categoryToEdit.name)
      setType(categoryToEdit.type || 'expense')
      if (categoryToEdit.icon) setSelectedIcon(categoryToEdit.icon)
      if (categoryToEdit.color) {
        const match = PALETTE_COLORS.find(c => c.rgb === categoryToEdit.color)
        setSelectedColor(match || { rgb: categoryToEdit.color, hex: `rgb(${categoryToEdit.color})`, name: 'Текущий цвет' })
      }
    }
  }, [categoryToEdit, isEditing])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return

    setSaving(true)
    let err
    if (isEditing && categoryToEdit) {
      const { error: updateErr } = await supabase
        .from('categories')
        .update({
          name: trimmed,
          type,
          icon: selectedIcon,
          color: selectedColor.rgb
        })
        .eq('id', categoryToEdit.id)
      err = updateErr
    } else {
      const { error: insertErr } = await supabase.from('categories').insert({
        name: trimmed,
        type,
        icon: selectedIcon,
        color: selectedColor.rgb
      })
      err = insertErr
    }
    setSaving(false)

    if (err) {
      setError(err.code === '23505' ? 'Такая категория уже есть' : err.message)
      return
    }
    onAdded()
  }

  return (
    <div className="new-category-page" style={{ position: 'relative', zIndex: 10 }}>
      {/* Step 21.3 Header */}
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink)',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Назад"
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
          {isEditing ? 'Редактирование категории' : 'Новая категория'}
        </h1>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <form className="form" onSubmit={handleSubmit}>
          {/* Step 21.3 Center Preview Circle */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: `rgba(${selectedColor.rgb}, 0.16)`,
                color: selectedColor.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '42px',
                border: `2px solid ${selectedColor.hex}`,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              {selectedIcon}
            </div>
          </div>

          {/* Name Field */}
          <label>Название категории</label>
          <div className="form-field-group" style={{ marginBottom: '20px' }}>
            <div className="form-field-icon-sq" style={{ background: `rgba(${selectedColor.rgb}, 0.12)`, color: selectedColor.hex }}>
              <span style={{ fontSize: '18px' }}>{selectedIcon}</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Супермаркеты"
              required
            />
          </div>

          {/* Type Selector (Step 21.3: reuse same toggle component) */}
          <label>Тип категории</label>
          <div className="type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              type="button"
              className={type === 'expense' ? 'active expense' : 'expense'}
              onClick={() => setType('expense')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(236, 93, 166, 0.15)',
                color: 'var(--expense)',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>↓</span>
              <span>Расход</span>
            </button>
            <button
              type="button"
              className={type === 'income' ? 'active income' : 'income'}
              onClick={() => setType('income')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(55, 184, 145, 0.15)',
                color: 'var(--income)',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>↑</span>
              <span>Доход</span>
            </button>
          </div>

          {/* Choose Icon Grid */}
          <label>Выберите иконку</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              padding: '4px'
            }}
          >
            {PRESET_ICONS.map(ic => {
              const isSelected = selectedIcon === ic
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setSelectedIcon(ic)}
                  style={{
                    fontSize: '24px',
                    height: '52px',
                    border: isSelected ? '2px solid var(--lavender-dark)' : '1px solid var(--hairline)',
                    background: isSelected ? 'var(--mat-2-bg)' : 'var(--mat-1-bg)',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {ic}
                </button>
              )
            })}
          </div>

          {/* Choose Color Swatches */}
          <label>Выберите цвет</label>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              padding: '6px 4px 14px',
              scrollbarWidth: 'none',
              marginBottom: '24px'
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
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: colorOption.hex,
                    border: isSelected ? '3px solid var(--ink)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  title={colorOption.name}
                  aria-label={colorOption.name}
                />
              )
            })}
          </div>

          {/* Preview Row (Step 21.3) */}
          <label>Предпросмотр</label>
          <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
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
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                {selectedIcon}
              </div>
              <div className="cat-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="cat-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>
                  {name || 'Новая категория'}
                </div>
                <div className="cat-sub" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                  {type === 'expense' ? 'Расходная категория' : 'Доходная категория'}
                </div>
                <div className="cat-progress">
                  <div className="cat-progress-fill" style={{ width: '0%', background: selectedColor.hex }} />
                </div>
              </div>
              <div className="cat-numbers" style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="cat-amount" style={{ fontSize: '13px', fontWeight: 700 }}>0,00 ₽</div>
                <div className="cat-pct" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>0%</div>
              </div>
            </div>
          </div>

          {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

          {/* Create / Edit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={saving || !name.trim()}
          >
            {saving ? 'Сохранение…' : (isEditing ? 'Сохранить изменения' : 'Создать категорию')}
          </button>
        </form>
      </div>
    </div>
  )
}
