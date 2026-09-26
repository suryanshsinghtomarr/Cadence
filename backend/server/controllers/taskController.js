import Task from '../models/Task.js'
import TimetableSlot from '../models/TimetableSlot.js'
import {
  completionRatePerSubject,
  computeWeeklyHours,
} from '../utils/statsHelper.js'

export const getTasks = async (req, res) => {
  try {
    const { subject, status, dueDate } = req.query

    const query = {
      userId: req.user.id,
    }

    if (subject) {
      query.subject = subject
    }

    if (status === 'completed') {
      query.isCompleted = true
    }

    if (status === 'pending') {
      query.isCompleted = false
    }

    if (dueDate) {
      const dayStart = new Date(dueDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dueDate)
      dayEnd.setHours(23, 59, 59, 999)

      query.dueDate = {
        $gte: dayStart,
        $lte: dayEnd,
      }
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 })
    return res.status(200).json(tasks)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks' })
  }
}

export const createTask = async (req, res) => {
  try {
    const { title, subject, dueDate, priority, status } = req.body
    console.log('[Tasks] Create request:', { userId: req.userId, title, subject, dueDate })

    if (!title || !subject || !dueDate) {
      return res
        .status(400)
        .json({ message: 'title, subject and dueDate are required' })
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      subject,
      dueDate,
      priority,
      status,
    })

    console.log('[Tasks] Created:', { id: task._id, userId: task.userId })
    return res.status(201).json(task)
  } catch (error) {
    console.error('Creation error: task', error)
    return res.status(500).json({ message: 'Failed to create task' })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, subject, dueDate, isCompleted, priority, status } = req.body

    const task = await Task.findOne({ _id: id, userId: req.user.id })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.title = title ?? task.title
    task.subject = subject ?? task.subject
    task.dueDate = dueDate ?? task.dueDate
    task.priority = priority ?? task.priority
    task.status = status ?? task.status

    if (typeof isCompleted === 'boolean') {
      task.isCompleted = isCompleted
    }

    if (task.isCompleted) {
      task.status = 'done'
    }

    await task.save()

    return res.status(200).json(task)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task' })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    })

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' })
    }

    return res.status(200).json({ message: 'Task deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task' })
  }
}

export const getTaskStats = async (req, res) => {
  try {
    const [tasks, slots] = await Promise.all([
      Task.find({ userId: req.user.id }),
      TimetableSlot.find({ userId: req.user.id }),
    ])

    const completionPerSubject = completionRatePerSubject(tasks)
    const weeklyHoursPerSubject = computeWeeklyHours(slots)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const pendingTasks = tasks.filter((task) => !task.isCompleted).length
    const completedTasks = tasks.filter((task) => task.isCompleted).length

    const dueToday = tasks.filter((task) => {
      const due = new Date(task.dueDate)
      return due >= today && due < tomorrow
    }).length

    return res.status(200).json({
      summary: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        dueToday,
      },
      weeklyHoursPerSubject,
      completionPerSubject,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to compute stats' })
  }
}
