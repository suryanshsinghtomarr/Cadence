import { ArrowUpRight } from 'lucide-react'
import GlassCard from './GlassCard.jsx'

function DashboardCard({ label, value, icon: Icon, glow, onClick }) {
  const interactiveClasses = onClick
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D16]'
    : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-transparent p-0 text-left ${interactiveClasses}`}
      disabled={!onClick}
    >
      <GlassCard className="group p-4 transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/30 active:scale-[0.98]">
        <div className="mb-3 flex items-center justify-between">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-indigo-700">
            <Icon size={16} />
          </div>
          <ArrowUpRight size={16} className="text-zinc-400 transition group-hover:text-indigo-600" />
        </div>
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{label}</p>
        <p className="mono mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      </GlassCard>
    </button>
  )
}

export default DashboardCard
