import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import GlassCard from '../components/GlassCard.jsx'
import GlowButton from '../components/GlowButton.jsx'
import ProgressRing from '../components/ProgressRing.jsx'
import SubjectBadge from '../components/SubjectBadge.jsx'
import { usePlanner } from '../context/PlannerContext.jsx'

function Goals() {
  const { goals, addGoal, logGoalSession } = usePlanner()
  const [subject, setSubject] = useState('')
  const [targetHours, setTargetHours] = useState('')

  const handleCreateGoal = (event) => {
    event.preventDefault()

    addGoal(subject, Number(targetHours))
    setSubject('')
    setTargetHours('')
  }

  const handleLogSession = (goalId) => {
    const value = window.prompt('Log session hours', '1.5')
    if (!value) {
      return
    }

    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed <= 0) {
      return
    }

    logGoalSession(goalId, parsed)
  }

  return (
    <section className="space-y-5">
      <GlassCard className="p-5">
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-indigo-700">planning / targets</p>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-950">Study Goals</h1>
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={handleCreateGoal}>
          <input
            placeholder="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            required
          />
          <input
            type="number"
            min="1"
            step="0.5"
            placeholder="Target Hours"
            value={targetHours}
            onChange={(event) => setTargetHours(event.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            required
          />
          <GlowButton type="submit" className="ripple-btn">Add Goal</GlowButton>
        </form>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const progress = goal.targetHours
            ? (goal.loggedHours / goal.targetHours) * 100
            : 0
          const completed = progress >= 100

          return (
            <GlassCard key={goal.id} className="relative p-4">
              {completed ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                  <CheckCircle2 size={14} /> Complete
                </span>
              ) : null}

              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">{goal.subject}</h3>
                <SubjectBadge subject={goal.subject} />
              </div>

              <div className="mb-4 flex items-center gap-4">
                <ProgressRing value={progress} />
                <div>
                  <p className="text-sm text-zinc-600">Logged Hours</p>
                  <p className="mono text-2xl font-semibold text-zinc-900">{goal.loggedHours.toFixed(1)}h</p>
                  <p className="text-sm text-zinc-500">of {goal.targetHours}h target</p>
                </div>
              </div>

              <GlowButton
                type="button"
                className="ripple-btn w-full"
                onClick={() => handleLogSession(goal.id)}
              >
                Log Session
              </GlowButton>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}

export default Goals
