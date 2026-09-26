import StudyGoal from '../models/StudyGoal.js'

const formatGoal = (goal) => {
  const loggedHours = goal.loggedSessions.reduce(
    (total, session) => total + session.durationHours,
    0,
  )

  return {
    ...goal.toObject(),
    loggedHours,
  }
}

export const getGoals = async (req, res) => {
  try {
    const goals = await StudyGoal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    return res.status(200).json(goals.map(formatGoal))
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch study goals' })
  }
}

export const createGoal = async (req, res) => {
  try {
    const { subject, targetHours } = req.body
    console.log('[Goals] Create request:', { userId: req.userId, subject, targetHours })

    if (!subject || !targetHours) {
      return res.status(400).json({ message: 'subject and targetHours are required' })
    }

    const goal = await StudyGoal.create({
      userId: req.userId,
      subject,
      targetHours,
    })

    console.log('[Goals] Created:', { id: goal._id, userId: goal.userId })
    return res.status(201).json(formatGoal(goal))
  } catch (error) {
    console.error('Creation error: goal', error)
    return res.status(500).json({ message: 'Failed to create study goal' })
  }
}

export const logSession = async (req, res) => {
  try {
    const { id } = req.params
    const { durationHours, date } = req.body

    if (!durationHours) {
      return res.status(400).json({ message: 'durationHours is required' })
    }

    const goal = await StudyGoal.findOne({ _id: id, userId: req.user.id })

    if (!goal) {
      return res.status(404).json({ message: 'Study goal not found' })
    }

    goal.loggedSessions.push({
      durationHours,
      date: date || new Date(),
    })

    await goal.save()

    return res.status(200).json(formatGoal(goal))
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log study session' })
  }
}
