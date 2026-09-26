import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard.jsx'
import GlowButton from '../components/GlowButton.jsx'
import Modal from '../components/Modal.jsx'
import SubjectBadge from '../components/SubjectBadge.jsx'
import { usePlanner } from '../context/PlannerContext.jsx'

function Timetable() {
  const { timetableSlots, addSlot, updateSlot, deleteSlot } = usePlanner()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    subject: '',
    day: 'Mon',
    startTime: '08:00',
    endTime: '09:00',
    location: '',
    color: '#7C3AED',
  })

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const grouped = useMemo(
    () =>
      weekDays.reduce((acc, day) => {
        acc[day] = timetableSlots
          .filter((slot) => slot.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
        return acc
      }, {}),
    [timetableSlots],
  )

  const resetForm = () => {
    setForm({
      subject: '',
      day: 'Mon',
      startTime: '08:00',
      endTime: '09:00',
      location: '',
      color: '#7C3AED',
    })
  }

  const openCreate = () => {
    setEditingId(null)
    resetForm()
    setIsOpen(true)
  }

  const openEdit = (slot) => {
    setEditingId(slot.id)
    setForm({
      subject: slot.subject,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location,
      color: slot.color,
    })
    setIsOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (editingId) {
      updateSlot(editingId, form)
    } else {
      addSlot(form)
    }

    setIsOpen(false)
    setEditingId(null)
    resetForm()
  }

  const handleDelete = (id) => {
    deleteSlot(id)
  }

  return (
    <section className="space-y-4">
      <GlassCard className="p-5">
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-indigo-700">planning / week</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Weekly Timetable</h1>
        <p className="mt-2 text-sm text-zinc-600">Plan your week with a clear, low-noise schedule.</p>
      </GlassCard>

      <div className="grid gap-3 xl:grid-cols-7">
        {weekDays.map((day) => (
          <GlassCard key={day} className="min-h-[250px] p-3">
            <h3 className="mono mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{day}</h3>
            <div className="space-y-2">
              {grouped[day].map((slot) => (
                <div
                  key={slot.id}
                  className="group rounded-xl border border-indigo-100/80 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"
                >
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <SubjectBadge subject={slot.subject} />
                    <div className="hidden gap-1 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => openEdit(slot)}
                        className="rounded-full bg-indigo-100 p-1 text-indigo-700"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        className="rounded-full bg-zinc-100 p-1 text-zinc-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mono text-xs font-semibold text-zinc-700">
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="text-xs text-slate-500">{slot.location}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-20 grid h-12 w-12 place-items-center rounded-full bg-zinc-950 text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98]"
      >
        <Plus size={24} />
      </button>

      <Modal open={isOpen} title={editingId ? 'Edit Slot' : 'Add Slot'} onClose={() => setIsOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              required
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, day }))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  form.day === day
                    ? 'bg-indigo-500 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
            <input
              type="color"
              value={form.color}
              onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white p-1"
            />
          </div>

          <GlowButton type="submit" className="w-full">
            {editingId ? 'Update Slot' : 'Create Slot'}
          </GlowButton>
        </form>
      </Modal>
    </section>
  )
}

export default Timetable
