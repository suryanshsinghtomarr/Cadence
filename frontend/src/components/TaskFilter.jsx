function TaskFilter({ filters, subjects, onChange }) {
  const inputClass = 'rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20'

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <select
        value={filters.subject}
        onChange={(event) => onChange('subject', event.target.value)}
        className={inputClass}
      >
        <option value="">All Subjects</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dueDate}
        onChange={(event) => onChange('dueDate', event.target.value)}
        className={inputClass}
      />

      <select
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
        className={inputClass}
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  )
}

export default TaskFilter
