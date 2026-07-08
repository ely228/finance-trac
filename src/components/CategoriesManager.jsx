import { useState } from 'react'
import { supabase } from '../supabaseClient'
import ConfirmDialog from './ConfirmDialog'

export default function CategoriesManager({ categories, onChanged }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return
    const { error: err } = await supabase.from('categories').insert({ name: trimmed })
    if (err) {
      setError(err.code === '23505' ? 'Такая категория уже есть' : err.message)
      return
    }
    setName('')
    onChanged()
  }

  async function confirmDelete() {
    if (!pending) return
    await supabase.from('categories').delete().eq('id', pending.id)
    setPending(null)
    onChanged()
  }

  return (
    <div className="card">
      <h2>Категории</h2>
      <form className="inline-form" onSubmit={handleAdd}>
        <input type="text" placeholder="Новая категория" value={name} onChange={e => setName(e.target.value)} />
        <button type="submit">Добавить</button>
      </form>
      {error && <div className="error">{error}</div>}
      {categories.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>Категорий пока нет — добавь первую выше.</p>
      ) : (
        <ul className="category-list">
          {categories.map(c => (
            <li key={c.id}>
              <span>{c.name}</span>
              <button className="tx-delete" onClick={() => setPending(c)} aria-label="Удалить">✕</button>
            </li>
          ))}
        </ul>
      )}

      {pending && (
        <ConfirmDialog
          title="Удалить категорию?"
          message={`«${pending.name}» — прошлые операции с этой категорией останутся, но выбрать её заново будет нельзя.`}
          onConfirm={confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}
