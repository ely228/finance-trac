import { supabase } from '../supabaseClient'
import { formatMoney } from '../utils'

export default function TransactionList({ transactions, onChanged, limit, title = 'Операции' }) {
  async function handleDelete(id) {
    if (!confirm('Удалить эту операцию?')) return
    await supabase.from('transactions').delete().eq('id', id)
    onChanged()
  }

  const list = limit ? transactions.slice(0, limit) : transactions
  const byDate = {}
  for (const t of list) {
    (byDate[t.date] ||= []).push(t)
  }
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="card">
      <h2>{title}</h2>
      {dates.length === 0 && <p className="muted">Пока нет операций за этот месяц.</p>}
      {dates.map(date => (
        <div key={date} className="day-group">
          <div className="day-group-title">
            {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
          </div>
          {byDate[date].map(t => (
            <div key={t.id} className={`tx-row ${t.type}`}>
              <div className="tx-icon">{t.type === 'expense' ? '↓' : '↑'}</div>
              <div className="tx-main">
                <span className="tx-cat">{t.category}</span>
                {t.comment && <span className="tx-comment">{t.comment}</span>}
              </div>
              <div className="tx-amount">
                {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
              </div>
              <button className="tx-delete" onClick={() => handleDelete(t.id)} aria-label="Удалить">✕</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
