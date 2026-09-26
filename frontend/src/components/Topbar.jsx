import { Menu } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import ProgressModal from './ProgressModal.jsx'

const labels = {
  dashboard: 'Dashboard',
  timetable: 'Timetable',
  goals: 'Goals',
  tasks: 'Tasks',
}

function Topbar({ user, onOpenMobileMenu }) {
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const location = useLocation()
  const segment = location.pathname.split('/').filter(Boolean).at(-1) || 'dashboard'
  const current = labels[segment] || 'Dashboard'

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 px-3 py-3 backdrop-blur-md md:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 md:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">cadence</p>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 md:text-xl">{current}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProgressModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-2 py-2 text-left hover:border-indigo-200 md:px-3"
            aria-label="Open study progress"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {(user?.name || 'S')[0]?.toUpperCase()}
            </div>
            <span className="hidden text-sm text-zinc-700 sm:inline">{user?.name || 'Student'}</span>
          </button>
        </div>
      </div>
      <ProgressModal open={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} />
    </header>
  )
}

export default Topbar
