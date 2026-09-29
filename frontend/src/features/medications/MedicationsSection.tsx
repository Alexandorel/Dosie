import { useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useMedications } from './useMedications'
import { MedicationForm, type MedicationFormValues } from './MedicationForm'
import type { Medication } from '@/types'

function toPayload(values: MedicationFormValues) {
  return {
    name: values.name,
    amount: values.amount,
    unit: values.unit,
    form: values.form === '' ? undefined : values.form,
    instructions: values.instructions.trim() === '' ? undefined : values.instructions,
    active: values.active,
  }
}

interface MedicationsSectionProps {
  patientId: string
}

export function MedicationsSection({ patientId }: MedicationsSectionProps) {
  const { medications, loading, error, refetch } = useMedications(patientId)

  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [deleting, setDeleting] = useState<Medication | null>(null)

  const [formError, setFormError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const base = `/patients/${patientId}/medications`

  async function handleCreate(values: MedicationFormValues) {
    setFormError(null)
    try {
      await api.post(base, toPayload(values))
      setAddOpen(false)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleUpdate(values: MedicationFormValues) {
    if (!editing) return
    setFormError(null)
    try {
      await api.patch(`${base}/${editing.id}`, toPayload(values))
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
      await api.delete(`${base}/${deleting.id}`)
      setDeleting(null)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Medications</h2>
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            setAddOpen(true)
          }}
          className="rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-700"
        >
          Add medication
        </button>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : medications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No medications yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {medications.map((med) => (
              <li key={med.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {med.name}
                    {!med.active && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {med.amount} {med.unit}
                    {med.form ? ` · ${med.form}` : ''}
                    {med.instructions ? ` · ${med.instructions}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null)
                      setEditing(med)
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(med)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add medication">
        <MedicationForm
          onSubmit={handleCreate}
          submitLabel="Add medication"
          serverError={formError}
        />
      </Modal>

      {/* Edit */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit medication">
        {editing && (
          <MedicationForm
            defaultValues={{
              name: editing.name,
              amount: Number(editing.amount),
              unit: editing.unit,
              form: editing.form ?? '',
              instructions: editing.instructions ?? '',
              active: editing.active,
            }}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
            serverError={formError}
          />
        )}
      </Modal>

      {/* Delete */}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete medication"
        message={`Are you sure you want to delete ${deleting?.name}? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}