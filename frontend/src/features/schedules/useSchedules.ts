import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import type { Schedule } from '@/types'

export function useSchedules(patientId: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/patients/${patientId}/schedules`)
      setSchedules(res.data.schedules)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load schedules.'))
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { schedules, loading, error, refetch }
}
