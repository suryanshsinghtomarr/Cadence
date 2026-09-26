import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'
import { subjectPalette } from '../data/mockData.js'
import { useAuth } from './AuthContext.jsx'

const PlannerContext = createContext(null)

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const normalizeDay = (day) => {
  if (typeof day === 'number' || /^\d$/.test(String(day))) {
    return weekDays[Number(day)] || String(day)
  }

  const value = String(day || '').trim().toLowerCase()
  const dayAliases = {
    sunday: 'Sun',
    sun: 'Sun',
    monday: 'Mon',
    mon: 'Mon',
    tuesday: 'Tue',
    tue: 'Tue',
    tues: 'Tue',
    wednesday: 'Wed',
    wed: 'Wed',
    thursday: 'Thu',
    thu: 'Thu',
    thurs: 'Thu',
    friday: 'Fri',
    fri: 'Fri',
    saturday: 'Sat',
    sat: 'Sat',
  }

  return dayAliases[value] || day
}

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const toLoggedHours = (goal) => {
  if (typeof goal.loggedHours === 'number') {
    return goal.loggedHours
  }

  return (goal.loggedSessions || []).reduce(
    (total, entry) => total + Number(entry.durationHours ?? entry),
    0,
  )
}

const normalizeSlot = (slot) => ({
  ...slot,
  id: slot._id || slot.id,
  day: normalizeDay(slot.day),
  location: slot.location || '',
})

const normalizeGoal = (goal) => ({
  ...goal,
  id: goal._id || goal.id,
  loggedSessions: goal.loggedSessions || [],
  loggedHours: toLoggedHours(goal),
})

const normalizeTask = (task, overrides = {}) => {
  const isCompleted = overrides.isCompleted ?? task.isCompleted ?? false
  const status = overrides.status || task.status || (isCompleted ? 'done' : 'todo')
  const priority = overrides.priority || task.priority || 'medium'

  return {
    ...task,
    ...overrides,
    id: task._id || task.id,
    isCompleted,
    status,
    priority,
  }
}

export function PlannerProvider({ children }) {
  const { user, token } = useAuth()
  const [timetableSlots, setTimetableSlots] = useState([])
  const [goals, setGoals] = useState([])
  const [tasks, setTasks] = useState([])

  const request = async (path, options = {}) => {
    const method = (options.method || 'GET').toUpperCase()
    const payload = options.body ? JSON.parse(options.body) : undefined
    console.info(`[Cadence] ${method} ${path}`, payload || '')

    try {
      const { data } = await api.request({
        method,
        url: path,
        data: payload,
        headers: options.headers,
      })
      console.info(`[Cadence] ${method} ${path} succeeded`)
      return data
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Request failed'
      console.error(`[Cadence] ${method} ${path} failed:`, message)
      throw new Error(message, { cause: error })
    }
  }

  useEffect(() => {
    if (!user?.id || !token) {
      setTimetableSlots([])
      setGoals([])
      setTasks([])
      return
    }

    let isMounted = true

    const loadPlannerData = async () => {
      try {
        const [slotsData, goalsData, tasksData] = await Promise.all([
          request('/timetable'),
          request('/goals'),
          request('/tasks'),
        ])

        if (!isMounted) {
          return
        }

        setTimetableSlots((slotsData || []).map(normalizeSlot))
        setGoals((goalsData || []).map(normalizeGoal))
        setTasks((tasksData || []).map((task) => normalizeTask(task)))
      } catch (error) {
        console.error('[Cadence] Failed to load planner data:', error.message)
        if (isMounted) {
          setTimetableSlots([])
          setGoals([])
          setTasks([])
        }
      }
    }

    loadPlannerData()

    return () => {
      isMounted = false
    }
  }, [user?.id, token])

  const addSlot = async (slot) => {
    if (!token) {
      return null
    }

    const created = await request('/timetable', {
      method: 'POST',
      body: JSON.stringify(slot),
    })

    const next = normalizeSlot(created)
    setTimetableSlots((prev) => [next, ...prev])
    return next
  }

  const updateSlot = async (slotId, updates) => {
    if (!token) {
      return null
    }

    const updated = await request(`/timetable/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })

    const next = normalizeSlot(updated)
    setTimetableSlots((prev) => prev.map((slot) => (slot.id === slotId ? next : slot)))
    return next
  }

  const deleteSlot = async (slotId) => {
    if (!token) {
      return null
    }

    await request(`/timetable/${slotId}`, { method: 'DELETE' })
    setTimetableSlots((prev) => prev.filter((slot) => slot.id !== slotId))
    return slotId
  }

  const addGoal = async (subject, targetHours) => {
    if (!token) {
      return null
    }

    const created = await request('/goals', {
      method: 'POST',
      body: JSON.stringify({ subject, targetHours: Number(targetHours) }),
    })

    const next = normalizeGoal(created)
    setGoals((prev) => [next, ...prev])
    return next
  }

  const logGoalSession = async (goalId, hours) => {
    if (!token) {
      return null
    }

    const updated = await request(`/goals/${goalId}/log`, {
      method: 'POST',
      body: JSON.stringify({ durationHours: Number(hours) }),
    })

    const next = normalizeGoal(updated)
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? next : goal)))
    return next
  }

  const createTask = async (task) => {
    if (!token) {
      return null
    }

    const payload = {
      title: task.title,
      subject: task.subject,
      dueDate: task.dueDate,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
    }

    const created = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const next = normalizeTask(created, {
      status: task.status || 'todo',
      priority: task.priority || 'medium',
    })

    setTasks((prev) => [next, ...prev])
    return next
  }

  const updateTask = async (taskId, updates) => {
    if (!token) {
      return null
    }

    const existing = tasks.find((task) => task.id === taskId)
    const isCompleted =
      typeof updates.isCompleted === 'boolean'
        ? updates.isCompleted
        : updates.status
          ? updates.status === 'done'
          : existing?.isCompleted

    const payload = {
      title: updates.title,
      subject: updates.subject,
      dueDate: updates.dueDate,
      isCompleted,
    }

    const updated = await request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    const next = normalizeTask(updated, {
      status: updates.status || existing?.status,
      priority: updates.priority || existing?.priority,
    })

    setTasks((prev) => prev.map((task) => (task.id === taskId ? next : task)))
    return next
  }

  const deleteTask = async (taskId) => {
    if (!token) {
      return null
    }

    await request(`/tasks/${taskId}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    return taskId
  }

  const stats = useMemo(() => {
    const completionMap = tasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { total: 0, completed: 0 }
      }

      acc[task.subject].total += 1
      if (task.isCompleted) {
        acc[task.subject].completed += 1
      }
      return acc
    }, {})

    const completionPerSubject = Object.entries(completionMap).map(([subject, value]) => ({
      subject,
      completionRate: value.total ? Math.round((value.completed / value.total) * 100) : 0,
    }))

    const hourMap = timetableSlots.reduce((acc, slot) => {
      const duration = Math.max(toMinutes(slot.endTime) - toMinutes(slot.startTime), 0) / 60
      acc[slot.subject] = (acc[slot.subject] || 0) + duration
      return acc
    }, {})

    const weeklyHoursPerSubject = Object.entries(hourMap).map(([subject, hours]) => ({
      subject,
      hours: Number(hours.toFixed(1)),
    }))

    const dayHoursMap = timetableSlots.reduce((acc, slot) => {
      const duration = Math.max(toMinutes(slot.endTime) - toMinutes(slot.startTime), 0) / 60
      acc[slot.day] = (acc[slot.day] || 0) + duration
      return acc
    }, {})

    const weeklyStudyData = timetableSlots.length
      ? weekDays.map((day) => ({
          day,
          hours: Number((dayHoursMap[day] || 0).toFixed(2)),
        }))
      : []

    const today = new Date()
    const todayLabel = weekDays[today.getDay()]

    const todaysClasses = timetableSlots.filter((slot) => slot.day === todayLabel)

    const dueToday = tasks.filter((task) => {
      const due = new Date(task.dueDate)
      return due.toDateString() === today.toDateString()
    })

    const upcomingTasks = tasks
      .filter((task) => !task.isCompleted)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)

    return {
      weeklyStudyData,
      weeklyHoursPerSubject,
      completionPerSubject,
      todaysClasses,
      upcomingTasks,
      summary: {
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((task) => !task.isCompleted).length,
        completedTasks: tasks.filter((task) => task.isCompleted).length,
        dueToday: dueToday.length,
      },
    }
  }, [tasks, timetableSlots])

  const value = useMemo(
    () => ({
      subjectPalette,
      timetableSlots,
      goals,
      tasks,
      addSlot,
      updateSlot,
      deleteSlot,
      addGoal,
      logGoalSession,
      createTask,
      updateTask,
      deleteTask,
      stats,
    }),
    [goals, tasks, timetableSlots, stats],
  )

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export const usePlanner = () => {
  const context = useContext(PlannerContext)

  if (!context) {
    throw new Error('usePlanner must be used within PlannerProvider')
  }

  return context
}
