import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await register(formData.name, formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <section className="min-h-screen bg-[#F4F3FF] text-zinc-950">
      <div className="grid min-h-screen md:grid-cols-5">
        <aside className="hidden border-r border-zinc-200/80 bg-white p-10 md:col-span-3 md:flex md:flex-col lg:p-14">
          <div className="flex items-center gap-3">
            <p className="text-xl font-bold text-zinc-950">Cadence</p>
          </div>

          <div className="my-auto max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-950 lg:text-5xl">
              Build your rhythm.
              <br />
              Keep your focus.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600">
              Set up a focused workspace for the schedule, goals, and tasks that move your semester forward.
            </p>
            <div className="mt-8 space-y-2 font-mono text-xs text-zinc-700">
              <p><span className="mr-2 text-indigo-600">•</span>Real-time timetable sync</p>
              <p><span className="mr-2 text-indigo-600">•</span>Persistent task breakdown</p>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center bg-[#F4F3FF] px-4 py-8 md:col-span-2 md:px-8">
          <div className="w-full max-w-md rounded-2xl border border-indigo-100/80 bg-white p-6 shadow-sm md:p-7">
            <h2 className="text-xl font-medium text-zinc-950">Create Account</h2>
            <p className="mt-1 text-xs text-zinc-400">Create your credentials to start your workspace</p>
            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Password</label>
                <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                </div>
              </div>

              {error ? <p className="text-xs text-red-400">{error}</p> : null}

              <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-500 active:scale-[0.98]">
                Create Account
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-400 underline-offset-4 hover:text-indigo-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  )
}

export default Register
