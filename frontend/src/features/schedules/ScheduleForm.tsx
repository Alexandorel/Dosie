import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Medication } from '@/types'

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const scheduleSchema = z.object({
  timeOfDay: z.string().regex(timeRegex, 'Time is required'),
  daysOfWeek: z.array(z.number()).min(1, 'Select at least one day'),
  active: z.boolean(),
  medicationIds: z.array(z.string()),
})

export type ScheduleFormValues = z.infer<typeof scheduleSchema>

interface ScheduleFormProps {
  availableMedications: Medication[]
  defaultValues?: Partial<ScheduleFormValues>
  onSubmit: (values: ScheduleFormValues) => Promise<void> | void
  submitLabel: string
  serverError?: string | null
}

const inputClass =
  'mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function ScheduleForm({
  availableMedications,
  defaultValues,
  onSubmit,
  submitLabel,
  serverError,
}: ScheduleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      timeOfDay: '08:00',
      daysOfWeek: [],
      active: true,
      medicationIds: [],
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="timeOfDay" className="block text-sm font-medium text-slate-700">
          Time
        </label>
        <input id="timeOfDay" type="time" {...register('timeOfDay')} className={inputClass} />
        {errors.timeOfDay && (
          <p className="mt-1 text-xs text-red-600">{errors.timeOfDay.message}</p>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Days</span>
        <Controller
          control={control}
          name="daysOfWeek"
          render={({ field }) => (
            <div className="mt-2 flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const checked = field.value.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        checked
                          ? field.value.filter((v) => v !== day.value)
                          : [...field.value, day.value],
                      )
                    }
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                      checked
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          )}
        />
        {errors.daysOfWeek && (
          <p className="mt-1 text-xs text-red-600">{errors.daysOfWeek.message}</p>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Medications</span>
        {availableMedications.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">
            No medications yet — add some first to attach them.
          </p>
        ) : (
          <Controller
            control={control}
            name="medicationIds"
            render={({ field }) => (
              <div className="mt-2 space-y-1">
                {availableMedications.map((med) => {
                  const checked = field.value.includes(med.id)
                  return (
                    <label key={med.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          field.onChange(
                            checked
                              ? field.value.filter((id) => id !== med.id)
                              : [...field.value, med.id],
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {med.name} <span className="text-slate-400">{med.amount} {med.unit}</span>
                    </label>
                  )
                })}
              </div>
            )}
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register('active')} className="h-4 w-4 rounded border-slate-300" />
        Active
      </label>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}