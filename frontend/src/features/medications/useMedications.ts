import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import type { Medication } from '@/types'

export function useMedications(patientId: string) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/patients/${patientId}/medications`)
      setMedications(res.data.medications)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load medications.'))
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { medications, loading, error, refetch }
}