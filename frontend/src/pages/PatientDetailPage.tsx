import { Link, useParams } from 'react-router-dom'
import { usePatient } from '@/features/patients/usePatient'
import { MedicationsSection } from '@/features/medications/MedicationsSection'
import { SchedulesSection } from '@/features/schedules/SchedulesSection'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patient, loading, error } = usePatient(id!)

  if (loading) {
    return <p className="text-slate-500">Loading…</p>
  }

  if (error || !patient) {
    return (
      <div>
        <p className="text-red-600">{error ?? 'Patient not found.'}</p>
        <Link to="/patients" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back to patients
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/patients" className="text-sm text-blue-600 hover:underline">
        ← Back to patients
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {patient.fullName}
      </h1>

      <dl className="mt-6 grid max-w-md grid-cols-[8rem_1fr] gap-y-3 text-sm">
        <dt className="text-slate-500">Phone</dt>
        <dd className="text-slate-900">{patient.phoneNumber}</dd>

        <dt className="text-slate-500">Timezone</dt>
        <dd className="text-slate-900">{patient.timezone}</dd>

        <dt className="text-slate-500">Language</dt>
        <dd className="text-slate-900">{patient.language}</dd>
      </dl>

      <div className="mt-10 space-y-8">
        <MedicationsSection patientId={patient.id} />
        <SchedulesSection patientId={patient.id} />
      </div>
    </div>
  )
}