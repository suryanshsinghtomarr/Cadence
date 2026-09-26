function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-indigo-100/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export default GlassCard
