import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useAuth } from '@/context/AuthContext'

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser, login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterForm) {
    setServerError(null)
    try {
      await registerUser(values)
      // Backend does not return a token on register, so log in right after.
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setServerError(err.response.data.error)
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Start monitoring medication with Dosie.
        </p>

        {serverError && (
          <div className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              {...register('fullName')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">
              Phone number <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              {...register('phoneNumber')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}