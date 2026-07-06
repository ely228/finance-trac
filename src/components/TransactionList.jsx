import { supabase } from '../supabaseClient'
import { formatMoney } from '../utils'

export default function TransactionList({ transactions, onChanged }) {
  async function handleDelete(id) {
    if (!confirm('Удалить эту операцию?')) return
    await supabase.from('transactions').delete().eq('id', id)
    onChanged()
  }

  const byDate = {}
  for (const t of transactions) {
    (byDate[t.date] ||= []).push(t)
  }
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) {
    return <div className="card"><p className="muted">Пока нет операций за этот месяц.</p></div>
  }

  return (
    <div className="card">
      <h2>Операции</h2>
      {dates.map(date => (
        <div key={date} className="day-group">
          <div className="day-group-title">
            {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
          </div>
          {byDate[date].map(t => (
            <div key={t.id} className={`tx-row ${t.type}`}>
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
