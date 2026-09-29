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
            Medication reminders, by a simple phone call.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Dosie calls your loved ones at the right time, reminds them to take their
            medication, and lets you know if something is wrong — no smartphone needed.
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

      <div className="relative hidden overflow-hidden bg-linear-to-br from-accent-500 to-accent-700 lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl">
                📞
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dosie is calling…</p>
                <p className="text-xs text-white/70">08:00 · Morning medication</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/90 px-4 py-2 text-sm text-slate-800">
                Good morning! It's time to take your Paracetamol. 💊
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-4 py-2 text-sm text-slate-800">
                Thank you, I'll take it now.
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/90 px-4 py-2 text-sm text-slate-800">
                Wonderful. How are you feeling today?
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}