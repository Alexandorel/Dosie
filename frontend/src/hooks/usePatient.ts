import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import type { Patient } from '@/types'

export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/patients/${id}`)
      setPatient(res.data.patient)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load patient.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { patient, loading, error, refetch }
}