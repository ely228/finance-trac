import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CategoriesManager({ categories, onChanged }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

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

  async function handleDelete(id, catName) {
    if (!confirm(`Удалить категорию «${catName}»? Прошлые операции с этой категорией останутся, но выбрать её заново будет нельзя.`)) return
    await supabase.from('categories').delete().eq('id', id)
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
      <ul className="category-list">
        {categories.map(c => (
          <li key={c.id}>
            <span>{c.name}</span>
            <button className="tx-delete" onClick={() => handleDelete(c.id, c.name)} aria-label="Удалить">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
