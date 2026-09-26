import TimetableSlot from '../models/TimetableSlot.js'
import validateSlot from '../utils/validateSlot.js'

export const getSlots = async (req, res) => {
  try {
    const slots = await TimetableSlot.find({ userId: req.user.id }).sort({ day: 1, startTime: 1 })
    return res.status(200).json(slots)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch timetable slots' })
  }
}

export const addSlot = async (req, res) => {
  try {
    const { subject, day, startTime, endTime, color, location } = req.body
    console.log('[Timetable] Create request:', { userId: req.userId, subject, day, startTime, endTime })

    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({ message: 'subject, day, startTime and endTime are required' })
    }

    const validation = await validateSlot({
      userId: req.userId,
      day,
      startTime,
      endTime,
    })

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    const slot = await TimetableSlot.create({
      userId: req.userId,
      subject,
      day,
      startTime,
      endTime,
      location,
      color,
    })

    console.log('[Timetable] Created:', { id: slot._id, userId: slot.userId })
    return res.status(201).json(slot)
  } catch (error) {
    console.error('Creation error: timetable slot', error)
    return res.status(500).json({ message: 'Failed to create timetable slot' })
  }
}

export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params
    const { subject, day, startTime, endTime, color, location } = req.body

    const existingSlot = await TimetableSlot.findOne({ _id: id, userId: req.user.id })

    if (!existingSlot) {
      return res.status(404).json({ message: 'Timetable slot not found' })
    }

    const nextDay = day ?? existingSlot.day
    const nextStartTime = startTime ?? existingSlot.startTime
    const nextEndTime = endTime ?? existingSlot.endTime

    const validation = await validateSlot({
      userId: req.user.id,
      day: nextDay,
      startTime: nextStartTime,
      endTime: nextEndTime,
      excludeId: id,
    })

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    existingSlot.subject = subject ?? existingSlot.subject
    existingSlot.day = nextDay
    existingSlot.startTime = nextStartTime
    existingSlot.endTime = nextEndTime
    existingSlot.location = location ?? existingSlot.location
    existingSlot.color = color ?? existingSlot.color

    await existingSlot.save()

    return res.status(200).json(existingSlot)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update timetable slot' })
  }
}

export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params

    const deletedSlot = await TimetableSlot.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    })

    if (!deletedSlot) {
      return res.status(404).json({ message: 'Timetable slot not found' })
    }

    return res.status(200).json({ message: 'Timetable slot deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete timetable slot' })
  }
}
