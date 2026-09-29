import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const patientSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
})

export type PatientFormValues = z.infer<typeof patientSchema>

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>
  onSubmit: (values: PatientFormValues) => Promise<void> | void
  submitLabel: string
  serverError?: string | null
}

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function PatientForm({
  defaultValues,
  onSubmit,
  submitLabel,
  serverError,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      timezone: 'Europe/Bucharest',
      language: 'ro',
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
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input id="fullName" type="text" {...register('fullName')} className={inputClass} />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">
          Phone number
        </label>
        <input id="phoneNumber" type="tel" {...register('phoneNumber')} className={inputClass} />
        {errors.phoneNumber && (
          <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">
          Timezone
        </label>
        <input id="timezone" type="text" {...register('timezone')} className={inputClass} />
        {errors.timezone && (
          <p className="mt-1 text-xs text-red-600">{errors.timezone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-slate-700">
          Language
        </label>
        <select id="language" {...register('language')} className={inputClass}>
          <option value="ro">Romanian</option>
          <option value="en">English</option>
        </select>
        {errors.language && (
          <p className="mt-1 text-xs text-red-600">{errors.language.message}</p>
        )}
      </div>

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