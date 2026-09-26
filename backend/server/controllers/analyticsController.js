import StudyGoal from '../models/StudyGoal.js'
import Task from '../models/Task.js'
import TimetableSlot from '../models/TimetableSlot.js'

const toDateKey = (value) => new Date(value).toISOString().slice(0, 10)

const addActivity = (activityMap, value, count = 1) => {
  if (!value) {
    return
  }

  const date = toDateKey(value)
  activityMap.set(date, (activityMap.get(date) || 0) + count)
}

const getMaxStreak = (dates) => {
  let maxStreak = 0
  let currentStreak = 0
  let previousDate = null

  dates.forEach((date) => {
    const currentDate = new Date(`${date}T00:00:00.000Z`)
    const dayGap = previousDate
      ? (currentDate - previousDate) / (1000 * 60 * 60 * 24)
      : null

    currentStreak = dayGap === 1 ? currentStreak + 1 : 1
    maxStreak = Math.max(maxStreak, currentStreak)
    previousDate = currentDate
  })

  return maxStreak
}

export const getActivityHeatmap = async (req, res) => {
  try {
    const [tasks, goals, timetableSlots] = await Promise.all([
      Task.find({ userId: req.user.id, $or: [{ isCompleted: true }, { status: 'done' }] })
        .select('updatedAt')
        .lean(),
      StudyGoal.find({ userId: req.user.id }).select('loggedSessions').lean(),
      TimetableSlot.find({ userId: req.user.id }).select('createdAt').lean(),
    ])

    const activityMap = new Map()

    tasks.forEach((task) => addActivity(activityMap, task.updatedAt))
    goals.forEach((goal) => {
      goal.loggedSessions.forEach((session) => addActivity(activityMap, session.date))
    })
    timetableSlots.forEach((slot) => addActivity(activityMap, slot.createdAt))

    const activity = [...activityMap.entries()]
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .map(([date, count]) => ({ date, count }))
    const activeDates = activity.map(({ date }) => date)

    return res.status(200).json({
      activity,
      totalActivity: activity.reduce((total, entry) => total + entry.count, 0),
      totalActiveDays: activeDates.length,
      maxStreak: getMaxStreak(activeDates),
    })
  } catch (error) {
    console.error('Failed to fetch activity heatmap:', error)
    return res.status(500).json({ message: 'Failed to fetch activity heatmap' })
  }
}