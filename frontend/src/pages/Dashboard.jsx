import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BellDot,
  CalendarClock,
  ChartNoAxesCombined,
  CircleCheckBig,
  ListTodo,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../components/DashboardCard.jsx'
import GlassCard from '../components/GlassCard.jsx'
import ProgressChart from '../components/ProgressChart.jsx'
import SubjectBadge from '../components/SubjectBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useStats } from '../hooks/useStats.js'
import { useTypewriter } from '../hooks/useTypewriter.js'
import { usePlanner } from '../context/PlannerContext.jsx'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { timetableSlots } = usePlanner()
  const { stats } = useStats()
  const [shouldAnimate] = useState(() => !sessionStorage.getItem('hasAnimatedDashboard'))
  const greeting = `Good Morning, ${user?.name || 'Student'}`
  const typed = useTypewriter(greeting, 35, shouldAnimate)

  useEffect(() => {
    sessionStorage.setItem('hasAnimatedDashboard', 'true')
  }, [])

  useEffect(() => {
    console.log('Dashboard Timetable Data:', timetableSlots)
  }, [timetableSlots])

  const summary = stats?.summary || { totalTasks: 0, pendingTasks: 0, completedTasks: 0, dueToday: 0 }
  const todayString = new Date().toISOString().slice(0, 10)

  return (
    <section className="w-full min-w-0 space-y-5">
      <GlassCard className="border-indigo-100/80 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mono mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-indigo-700">
              today / overview
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight pb-1 text-zinc-950 md:text-4xl">{typed}</h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-zinc-600">Turn your daily study goals into visible progress.</p>
        </div>
      </GlassCard>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="Total Tasks"
          value={summary.totalTasks}
          icon={ListTodo}
          glow=""
          onClick={() => navigate('/tasks')}
        />
        <DashboardCard
          label="Pending Tasks"
          value={summary.pendingTasks}
          icon={BellDot}
          glow=""
          onClick={() => navigate('/tasks?status=pending')}
        />
        <DashboardCard
          label="Completed"
          value={summary.completedTasks}
          icon={CircleCheckBig}
          glow=""
          onClick={() => navigate('/tasks?status=completed')}
        />
        <DashboardCard
          label="Due Today"
          value={summary.dueToday}
          icon={CalendarClock}
          glow=""
          onClick={() => navigate(`/tasks?dueDate=${todayString}`)}
        />
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="min-w-0 overflow-hidden p-4 lg:col-span-2 md:p-5">
          <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <ChartNoAxesCombined size={17} className="text-indigo-600" /> Weekly Study Curve
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyStudyData || []}>
                <defs>
                  <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="day" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,.3)', borderRadius: 12 }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studyGradient)"
                  isAnimationActive={shouldAnimate}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <ProgressChart data={stats?.weeklyHoursPerSubject || []} shouldAnimate={shouldAnimate} />
      </div>

        <GlassCard className="p-5">
    <h3 className="mb-4 text-lg font-semibold tracking-tight text-zinc-950">Today&apos;s Timetable</h3>
        <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-1">
          {(stats?.todaysClasses || []).length ? (
            stats.todaysClasses.map((slot) => (
              <div
                key={slot.id}
                className="min-w-[220px] rounded-xl border border-indigo-100/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
              >
                <SubjectBadge subject={slot.subject} />
                <p className="mono mt-3 text-sm text-zinc-700">
                  {slot.startTime} - {slot.endTime}
                </p>
                <p className="text-sm text-slate-500">{slot.location}</p>
              </div>
            ))
          ) : (
            <p className="text-zinc-600">No classes scheduled today.</p>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="mb-4 text-lg font-semibold tracking-tight text-zinc-950">Upcoming Tasks</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stats?.upcomingTasks || []).map((task) => (
            <div key={task.id} className="rounded-xl border border-indigo-100/80 bg-white p-3 shadow-sm transition hover:border-indigo-200">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    task.priority === 'high' ? 'bg-slate-300' : task.priority === 'medium' ? 'bg-slate-500' : 'bg-slate-700'
                  }`}
                />
                <span className="text-xs uppercase tracking-wider text-zinc-600">{task.priority}</span>
              </div>
              <p className="font-semibold text-zinc-900">{task.title}</p>
              <p className="text-xs text-zinc-500">Due {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  )
}

export default Dashboard
