import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import type { Alert } from '@/types'

export function useAlerts(patientId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/patients/${patientId}/alerts`)
      setAlerts(res.data.alerts)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load alerts.'))
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { alerts, loading, error, refetch }
}