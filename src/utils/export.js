import * as XLSX from 'xlsx'

function categorySummary(transactions) {
  const byCat = {}
  for (const t of transactions) {
    const key = `${t.category}__${t.type}`
    byCat[key] = byCat[key] || { category: t.category, type: t.type, total: 0, count: 0 }
    byCat[key].total += Number(t.amount)
    byCat[key].count += 1
  }
  return Object.values(byCat).sort((a, b) => b.total - a.total)
}

export function exportCSV(transactions, monthLabelText) {
  const header = ['Дата', 'Категория', 'Тип', 'Сумма', 'Комментарий']
  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => [
      t.date,
      t.category,
      t.type === 'income' ? 'Доход' : 'Расход',
      String(t.amount).replace('.', ','),
      (t.comment || '').replace(/[\r\n,]+/g, ' '),
    ])

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fin-trac_${monthLabelText.replace(/\s+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportXLSX(transactions, monthLabelText) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  const opRows = sorted.map(t => ({
    'Дата': t.date,
    'Категория': t.category,
    'Тип': t.type === 'income' ? 'Доход' : 'Расход',
    'Сумма, ₽': Number(t.amount),
    'Комментарий': t.comment || '',
  }))
  const income = sorted.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = sorted.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  opRows.push({}, { 'Дата': 'ИТОГО Доход', 'Сумма, ₽': income }, { 'Дата': 'ИТОГО Расход', 'Сумма, ₽': expense }, { 'Дата': 'БАЛАНС', 'Сумма, ₽': income - expense })

  const wsOps = XLSX.utils.json_to_sheet(opRows);
  wsOps['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 32 }]
  wsOps['!autofilter'] = { ref: `A1:E${sorted.length + 1}` }
  wsOps['!freeze'] = { xSplit: 0, ySplit: 1 }

  const summary = categorySummary(sorted)
  const sumRows = summary.map(s => ({
    'Категория': s.category,
    'Тип': s.type === 'income' ? 'Доход' : 'Расход',
    'Сумма, ₽': s.total,
    'Операций': s.count,
  }))
  const wsSum = XLSX.utils.json_to_sheet(sumRows)
  wsSum['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 14 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsOps, 'Операции')
  XLSX.utils.book_append_sheet(wb, wsSum, 'По категориям')

  XLSX.writeFile(wb, `fin-trac_${monthLabelText.replace(/\s+/g, '-')}.xlsx`)
}
