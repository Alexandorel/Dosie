import { useState } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useMedications } from '@/features/medications/useMedications'
import { useSchedules } from './useSchedules'
import { ScheduleForm, type ScheduleFormValues } from './ScheduleForm'
import type { Schedule } from '@/types'

const DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  0: 'Sun',
}
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

// "1970-01-01T08:00:00.000Z" → "08:00"
function isoToTime(iso: string) {
  return iso.slice(11, 16)
}

function formatDays(days: number[]) {
  return DAY_ORDER.filter((d) => days.includes(d))
    .map((d) => DAY_LABELS[d])
    .join(', ')
}

interface SchedulesSectionProps {
  patientId: string
}

export function SchedulesSection({ patientId }: SchedulesSectionProps) {
  const { schedules, loading, error, refetch } = useSchedules(patientId)
  const { medications } = useMedications(patientId)

  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleting, setDeleting] = useState<Schedule | null>(null)

  const [formError, setFormError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const base = `/patients/${patientId}/schedules`

  async function handleCreate(values: ScheduleFormValues) {
    setFormError(null)
    try {
      await api.post(base, values)
      setAddOpen(false)
      await refetch()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  async function handleUpdate(values: ScheduleFormValues) {
    if (!editing) return
    setFormError(null)
    try {
      await api.patch(`${base}/${editing.id}`, values)
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
        <h2 className="text-sm font-semibold text-slate-700">Schedules</h2>
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            setAddOpen(true)
          }}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Add schedule
        </button>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : schedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No schedules yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {schedules.map((schedule) => (
              <li key={schedule.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {isoToTime(schedule.timeOfDay)}
                    <span className="ml-2 font-normal text-slate-500">
                      {formatDays(schedule.daysOfWeek)}
                    </span>
                    {!schedule.active && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {schedule.medications.length === 0
                      ? 'No medications attached'
                      : schedule.medications.map((m) => m.medication.name).join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null)
                      setEditing(schedule)
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(schedule)}
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
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add schedule">
        <ScheduleForm
          availableMedications={medications}
          onSubmit={handleCreate}
          submitLabel="Add schedule"
          serverError={formError}
        />
      </Modal>

      {/* Edit */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit schedule">
        {editing && (
          <ScheduleForm
            availableMedications={medications}
            defaultValues={{
              timeOfDay: isoToTime(editing.timeOfDay),
              daysOfWeek: editing.daysOfWeek,
              active: editing.active,
              medicationIds: editing.medications.map((m) => m.medicationId),
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
        title="Delete schedule"
        message={`Are you sure you want to delete the ${
          deleting ? isoToTime(deleting.timeOfDay) : ''
        } schedule? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}