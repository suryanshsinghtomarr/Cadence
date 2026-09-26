function SubjectBadge({ subject }) {
  return (
    <span className="mono inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-100 px-3 py-1 text-[10px] font-medium text-indigo-700">
      {subject}
    </span>
  )
}

export default SubjectBadge
