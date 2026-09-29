import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { usePatients } from '@/features/patients/usePatients'
import { PatientForm, type PatientFormValues } from '@/features/patients/PatientForm'
import type { Patient } from '@/types'

export function PatientsPage() {
  const { patients, loading, error, refetch } = usePatients()
  const navigate = useNavigate()

  // Every modal.
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleting, setDeleting] = useState<Patient | null>(null)

  const [formError, setFormError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleCreate(values: PatientFormValues) {
    setFormError(null)
    try {
      await api.post('/patients', values)
      setAddOpen(false)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleUpdate(values: PatientFormValues) {
    if (!editing) return
    setFormError(null)
    try {
      await api.patch(`/patients/${editing.id}`, values)
      setEditing(null)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api.delete(`/patients/${deleting.id}`)
      setDeleting(null)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Patients</h1>
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            setAddOpen(true)
          }}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700"
        >
          Add patient
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : patients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No patients yet. Add your first one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Timezone</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="font-medium text-accent-600 hover:underline"
                      >
                        {patient.fullName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.timezone}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormError(null)
                            setEditing(patient)
                          }}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(patient)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add patient */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add patient">
        <PatientForm onSubmit={handleCreate} submitLabel="Add patient" serverError={formError} />
      </Modal>

      {/* Edit patient */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit patient">
        {editing && (
          <PatientForm
            defaultValues={{
              fullName: editing.fullName,
              phoneNumber: editing.phoneNumber,
              timezone: editing.timezone,
              language: editing.language,
            }}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
            serverError={formError}
          />
        )}
      </Modal>

      {/* Delete patient */}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete patient"
        message={`Are you sure you want to delete ${deleting?.fullName}? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}