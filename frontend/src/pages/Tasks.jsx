import { LayoutGrid, List, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import GlowButton from '../components/GlowButton.jsx'
import TaskFilter from '../components/TaskFilter.jsx'
import TaskItem from '../components/TaskItem.jsx'
import { useTasks } from '../hooks/useTasks.js'

function Tasks() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('list')
  const [expandedCreate, setExpandedCreate] = useState(false)
  const [filters, setFilters] = useState({
    subject: '',
    dueDate: '',
    status: '',
  })
  const [form, setForm] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
  })

  const { tasks, createTask, updateTask, deleteTask } = useTasks(filters)

  useEffect(() => {
    const status = searchParams.get('status') || ''
    const dueDate = searchParams.get('dueDate') || ''
    const subject = searchParams.get('subject') || ''

    setFilters((prev) => ({
      ...prev,
      status,
      dueDate,
      subject,
    }))
  }, [searchParams])

  const subjects = useMemo(
    () => [...new Set(tasks.map((task) => task.subject))].sort((a, b) => a.localeCompare(b)),
    [tasks],
  )

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFormChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const handleCreateTask = (event) => {
    event.preventDefault()

    createTask(form)
    setForm({ title: '', subject: '', dueDate: '', priority: 'medium', status: 'todo' })
    setExpandedCreate(false)
  }

  const handleToggleComplete = (task, isCompleted) => {
    updateTask(task.id, { isCompleted })
  }

  const handleDelete = (id) => {
    deleteTask(id)
  }

  const moveStatus = (taskId, status) => {
    updateTask(taskId, { status })
  }

  const grouped = {
    todo: tasks.filter((task) => task.status === 'todo'),
    'in-progress': tasks.filter((task) => task.status === 'in-progress'),
    done: tasks.filter((task) => task.status === 'done'),
  }

  return (
    <section className="space-y-4">
      <GlassCard className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-indigo-300">execution / queue</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Tasks</h1>
          </div>
          <div className="inline-flex rounded-full border border-indigo-100/80 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                viewMode === 'list' ? 'bg-zinc-950 text-white' : 'text-zinc-500'
              }`}
            >
              <span className="inline-flex items-center gap-2"><List size={15} /> List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                viewMode === 'kanban' ? 'bg-zinc-950 text-white' : 'text-zinc-500'
              }`}
            >
              <span className="inline-flex items-center gap-2"><LayoutGrid size={15} /> Kanban</span>
            </button>
          </div>
        </div>

        <TaskFilter filters={filters} subjects={subjects} onChange={handleFilterChange} />

        <div>
          {!expandedCreate ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
              onClick={() => setExpandedCreate(true)}
            >
              <Plus size={15} /> Add Task
            </button>
          ) : (
            <form className="grid gap-3 rounded-xl border border-indigo-100/80 bg-indigo-50/30 p-3 md:grid-cols-5" onSubmit={handleCreateTask}>
              <input
                name="title"
                placeholder="Task title"
                value={form.title}
                onChange={handleFormChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                required
              />
              <input
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleFormChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                required
              />
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleFormChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                required
              />
              <select
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="high" className="bg-white">High</option>
                <option value="medium" className="bg-white">Medium</option>
                <option value="low" className="bg-white">Low</option>
              </select>
              <div className="flex gap-2">
                <GlowButton type="submit" className="w-full">Save</GlowButton>
                <button
                  type="button"
                  onClick={() => setExpandedCreate(false)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </GlassCard>

      {viewMode === 'list' ? (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { key: 'todo', title: 'To Do' },
            { key: 'in-progress', title: 'In Progress' },
            { key: 'done', title: 'Done' },
          ].map((column) => (
            <GlassCard key={column.key} className="p-4">
              <h3 className="mb-3 text-lg font-semibold tracking-tight text-zinc-950">{column.title}</h3>
              <div className="space-y-3">
                {grouped[column.key].map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onMoveStatus={moveStatus}
                  />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  )
}

export default Tasks
