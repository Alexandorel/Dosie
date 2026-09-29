import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MEDICATION_UNITS, MEDICATION_FORMS } from '@/types'

const medicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  // register('amount', { valueAsNumber: true }) hands Zod a real number.
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  unit: z.enum(MEDICATION_UNITS),
  form: z.enum(MEDICATION_FORMS).or(z.literal('')),
  instructions: z.string(),
  active: z.boolean(),
})

export type MedicationFormValues = z.infer<typeof medicationSchema>

interface MedicationFormProps {
  defaultValues?: Partial<MedicationFormValues>
  onSubmit: (values: MedicationFormValues) => Promise<void> | void
  submitLabel: string
  serverError?: string | null
}

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100'

export function MedicationForm({
  defaultValues,
  onSubmit,
  submitLabel,
  serverError,
}: MedicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      unit: 'mg',
      form: '',
      instructions: '',
      active: true,
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
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input id="name" type="text" {...register('name')} className={inputClass} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            {...register('amount', { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
            Unit
          </label>
          <select id="unit" {...register('unit')} className={inputClass}>
            {MEDICATION_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="form" className="block text-sm font-medium text-slate-700">
          Form <span className="text-slate-400">(optional)</span>
        </label>
        <select id="form" {...register('form')} className={inputClass}>
          <option value="">—</option>
          {MEDICATION_FORMS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-slate-700">
          Instructions <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="instructions"
          rows={2}
          {...register('instructions')}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          {...register('active')}
          className="h-4 w-4 rounded border-slate-300"
        />
        Active
      </label>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
