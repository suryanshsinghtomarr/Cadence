import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import api from '../api/axios.js'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const toDateKey = (date) => date.toISOString().slice(0, 10)

const formatCount = (count) => `${count} completed ${count === 1 ? 'activity' : 'activities'}`

function ProgressModal({ open, onClose }) {
  const year = new Date().getUTCFullYear()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    let active = true

    api.get('/analytics/activity-heatmap')
      .then(({ data: response }) => {
        if (active) {
          setData(response)
          setError('')
        }
      })
      .catch(() => {
        if (active) {
          setError('Activity data could not be loaded.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  const activityByDate = useMemo(
    () => new Map((data?.activity || []).map((entry) => [entry.date, entry.count])),
    [data],
  )

  const months = useMemo(() => MONTH_NAMES.map((name, monthIndex) => {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1))
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
    const leadingEmptyDays = firstDay.getUTCDay()
    const weekColumns = Math.ceil((leadingEmptyDays + daysInMonth) / 7)

    const cells = Array.from({ length: weekColumns * 7 }, (_, cellIndex) => {
      const dayNumber = cellIndex - leadingEmptyDays + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null
      }

      const date = new Date(Date.UTC(year, monthIndex, dayNumber))
      const dateKey = toDateKey(date)
      return { date, dateKey, count: activityByDate.get(dateKey) || 0 }
    })

    return { name, cells }
  }), [activityByDate, year])

  const showLoading = loading || (open && !data && !error)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-modal-title"
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 pt-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-indigo-700">progress / activity</p>
            <h2 id="progress-modal-title" className="mt-1 text-xl font-semibold text-zinc-950">Your study rhythm</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label="Close progress modal">
            <X size={18} />
          </button>
        </div>

        {showLoading ? <p className="mt-8 text-sm text-zinc-500">Loading activity...</p> : null}
        {error ? <p className="mt-8 text-sm text-red-600">{error}</p> : null}
        {!showLoading && !error ? (
          <>
            <div className="mb-2 mt-12 flex items-center justify-between">
              <h3 className="mt-4 mb-4 text-lg font-semibold text-zinc-900">Study Activity</h3>
            </div>
            <div className="mt-2 w-full overflow-x-hidden overflow-y-visible pb-2">
            <div className="flex items-start justify-between gap-x-1.5 px-1">
              {months.map(({ name, cells }) => (
                <div key={name} className="flex flex-col items-start">
                  <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
                    {cells.map((cell, index) => {
                      if (!cell) {
                        return <span key={`${name}-empty-${index}`} className="h-2.5 w-2.5" aria-hidden="true" />
                      }

                      const { date, dateKey, count } = cell
                      const level = count === 0 ? 'bg-zinc-100' : count === 1 ? 'bg-[#00b8a3]' : count <= 3 ? 'bg-[#2cbb5d]' : count <= 6 ? 'bg-[#15803d]' : 'bg-[#166534]'
                      return <span key={dateKey} title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}: ${formatCount(count)}`} className={`h-2.5 w-2.5 rounded-[3px] ${level}`} />
                    })}
                  </div>
                  <span className="mt-2 text-xs text-zinc-500">{name}</span>
                </div>
              ))}
            </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}

export default ProgressModal