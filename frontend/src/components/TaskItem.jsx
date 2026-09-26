import { CalendarClock, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import SubjectBadge from './SubjectBadge.jsx'

const priorityDot = {
  high: 'bg-slate-300',
  medium: 'bg-slate-500',
  low: 'bg-slate-700',
}

function TaskItem({ task, onToggleComplete, onDelete, onMoveStatus }) {
  const overdue = !task.isCompleted && new Date(task.dueDate) < new Date()

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className={`rounded-xl border border-indigo-100/80 bg-white p-3 shadow-sm transition-colors hover:border-indigo-200 ${
        overdue ? 'border-indigo-300' : ''
      } ${task.isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <SubjectBadge subject={task.subject} />
          <h4 className={`font-semibold text-zinc-900 ${task.isCompleted ? 'line-through' : ''}`}>
            {task.title}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
            className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition hover:border-indigo-200 hover:text-indigo-600 active:scale-[0.98]"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="mono inline-flex items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-100 px-2 py-1 text-[11px] text-indigo-700">
          <CalendarClock size={13} />
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
          <span className={`h-2.5 w-2.5 rounded-full ${priorityDot[task.priority] || 'bg-indigo-400'}`} />
          {task.priority}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleComplete(task, !task.isCompleted)}
          className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.98]"
        >
          {task.isCompleted ? 'Mark Pending' : 'Mark Done'}
        </button>
        {onMoveStatus ? (
          <>
            <button
              type="button"
              onClick={() => onMoveStatus(task.id, 'todo')}
              className="rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              To Do
            </button>
            <button
              type="button"
              onClick={() => onMoveStatus(task.id, 'in-progress')}
              className="rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => onMoveStatus(task.id, 'done')}
              className="rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Done
            </button>
          </>
        ) : null}
      </div>
    </motion.article>
  )
}

export default TaskItem
