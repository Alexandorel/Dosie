import { useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { useAlerts } from './useAlerts'
import type { AlertSeverity } from '@/types'

// Semantic colors for severity — separate from the terracotta accent.
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

interface AlertsSectionProps {
  patientId: string
}

export function AlertsSection({ patientId }: AlertsSectionProps) {
  const { alerts, loading, error, refetch } = useAlerts(patientId)
  const [ackingId, setAckingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleAcknowledge(id: string) {
    setAckingId(id)
    setActionError(null)
    try {
      await api.patch(`/patients/${patientId}/alerts/${id}/acknowledge`)
      await refetch()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setAckingId(null)
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-700">Alerts</h2>

      {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : alerts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No alerts. All good.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(alert.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-800">{alert.message}</p>
                </div>

                {alert.acknowledged ? (
                  <span className="flex-none text-xs font-medium text-slate-400">
                    Acknowledged
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={ackingId === alert.id}
                    className="flex-none rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                  >
                    {ackingId === alert.id ? 'Saving…' : 'Acknowledge'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
