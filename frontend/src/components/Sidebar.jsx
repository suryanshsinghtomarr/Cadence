import {
  CalendarDays,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Target,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

const TIMER_SECONDS = 25 * 60

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function FocusTimer({ collapsed }) {
  const [mode, setMode] = useState('timer')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startedAt = useRef(null)

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const updateElapsed = () => {
      const nextElapsed = Math.floor((Date.now() - startedAt.current) / 1000)

      if (mode === 'timer' && nextElapsed >= TIMER_SECONDS) {
        setElapsedSeconds(TIMER_SECONDS)
        setIsRunning(false)
        return
      }

      setElapsedSeconds(nextElapsed)
    }

    updateElapsed()
    const interval = window.setInterval(updateElapsed, 250)

    return () => window.clearInterval(interval)
  }, [isRunning, mode])

  const toggleRunning = () => {
    if (isRunning) {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000))
      setIsRunning(false)
      return
    }

    startedAt.current = Date.now() - elapsedSeconds * 1000
    setIsRunning(true)
  }

  const reset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
    startedAt.current = null
  }

  const changeMode = (nextMode) => {
    if (nextMode === mode) {
      return
    }

    setMode(nextMode)
    reset()
  }

  const displaySeconds = mode === 'timer'
    ? Math.max(0, TIMER_SECONDS - elapsedSeconds)
    : elapsedSeconds

  return (
    <section className={`rounded-xl border border-zinc-200/60 bg-indigo-50/50 p-3 ${collapsed ? 'flex flex-col items-center' : ''}`} aria-label="Focus timer">
      {!collapsed ? (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-800">Focus timer</span>
          <div className="flex rounded-md border border-zinc-200/60 bg-white/70 p-0.5 text-[10px] font-medium text-zinc-500">
            <button
              type="button"
              onClick={() => changeMode('timer')}
              className={`rounded px-2 py-1 ${mode === 'timer' ? 'bg-zinc-950 text-white' : 'hover:text-zinc-800'}`}
              aria-pressed={mode === 'timer'}
            >
              Timer
            </button>
            <button
              type="button"
              onClick={() => changeMode('stopwatch')}
              className={`rounded px-2 py-1 ${mode === 'stopwatch' ? 'bg-zinc-950 text-white' : 'hover:text-zinc-800'}`}
              aria-pressed={mode === 'stopwatch'}
            >
              Stopwatch
            </button>
          </div>
        </div>
      ) : null}

      <p className="font-mono text-xl font-bold text-zinc-950" aria-live="polite">
        {formatTime(displaySeconds)}
      </p>

      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleRunning}
          className="rounded-lg bg-zinc-950 p-1.5 text-white"
          aria-label={isRunning ? 'Pause focus timer' : 'Start focus timer'}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          onClick={reset}
          className="p-1.5 text-zinc-500 hover:text-zinc-800"
          aria-label="Reset focus timer"
          title="Reset"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  )
}

function Sidebar({ user, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/login')
  }

  const handleLogin = () => {
    setMobileOpen(false)
    navigate('/login')
  }

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-zinc-950/20 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu backdrop"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen p-4 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className={`relative flex h-full flex-col border-r border-zinc-200/80 bg-white p-4 transition-all duration-300 ${
            collapsed ? 'w-[92px]' : 'w-[270px]'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            {!collapsed ? (
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-950">Cadence</h2>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className="hidden rounded-md border border-zinc-200 bg-white p-2 text-zinc-500 transition hover:border-indigo-200 hover:text-zinc-900 active:scale-[0.98] md:block"
              >
                {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-500 md:hidden"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-600 hover:bg-indigo-50 hover:text-zinc-900'
                      }`}
                    >
                      <Icon size={18} />
                      {!collapsed ? <span className="font-medium">{item.label}</span> : null}
                      {isActive ? <span className="absolute left-0 h-5 w-0.5 rounded-r bg-indigo-300" /> : null}
                    </motion.div>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="my-5">
            <FocusTimer collapsed={collapsed} />
          </div>

          <div className="mt-auto rounded-xl border border-indigo-100/80 bg-indigo-50/40 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {(user?.name || 'S').slice(0, 1).toUpperCase()}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{user?.name}</p>
                </div>
              ) : null}
            </div>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] ${
                  collapsed ? 'px-2' : ''
                }`}
                title="Logout"
              >
                <LogOut size={16} />
                {!collapsed ? <span>Logout</span> : null}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] ${
                  collapsed ? 'px-2' : ''
                }`}
                title="Login"
              >
                <LogOut size={16} />
                {!collapsed ? <span>Login</span> : null}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
