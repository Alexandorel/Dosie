import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/features/dashboard/useDashboard'
import type { AlertSeverity } from '@/types'

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  info: 'bg-slate-100 text-slate-700',
  warning: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-700',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const { summary, loading, error } = useDashboard()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Welcome, {user?.fullName}
      </h1>
      <p className="mt-1 text-slate-500">Here's an overview of your patients.</p>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : error || !summary ? (
        <p className="mt-8 text-red-600">{error ?? 'Failed to load dashboard.'}</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/patients"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-200 hover:shadow"
            >
              <p className="text-sm text-slate-500">Patients</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {summary.patientsCount}
              </p>
            </Link>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Open alerts</p>
              <p
                className={`mt-2 text-3xl font-semibold tabular-nums ${
                  summary.openAlertsCount > 0 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {summary.openAlertsCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Active schedules</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {summary.activeSchedulesCount}
              </p>
            </div>
          </div>

          {/* Recent alerts */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold text-slate-700">Recent alerts</h2>
            <div className="mt-3">
              {summary.recentAlerts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No open alerts. Everything looks good.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                  {summary.recentAlerts.map((alert) => (
                    <li key={alert.id}>
                      <Link
                        to={`/patients/${alert.patientId}`}
                        className="flex items-start justify-between gap-4 px-4 py-3 transition hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[alert.severity]}`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                              {alert.patientName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(alert.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">{alert.message}</p>
                        </div>
                        <span className="flex-none text-sm text-accent-600">View →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}