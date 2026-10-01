import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) return null

  // Already signed => dashboard.
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Left: content + actions */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-16">
        <div className="mx-auto w-full max-w-md">
          <span className="text-xl font-semibold tracking-tight text-accent-600">Dosie</span>

          <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-slate-900">
            Care for them, even when you can't be there.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Let Dosie handle the daily medication reminders, so you can stop worrying
            about whether they remembered.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-md bg-accent-600 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-accent-700"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right: incoming-call phone mockup */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-accent-500 to-accent-700 lg:flex">
        <div className="flex aspect-9/18 w-44 flex-col rounded-[26px] border border-white/15 bg-[#1c1613] p-3 shadow-2xl">
          <div className="flex flex-1 flex-col items-center justify-between px-2 py-6 text-white">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest text-white/60">
                Incoming call
              </p>
              <p className="mt-1.5 text-xl font-semibold">Dosie</p>
              <p className="mt-1 text-[11.5px] text-white/60">08:00 · Morning medication</p>
            </div>

            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white/10 text-2xl">
              💊
            </div>

            <div className="flex gap-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-lg">
                ✕
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-lg">
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}