import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Welcome, {user?.fullName}
      </h1>
      <p className="mt-2 text-slate-500">
        This is your Dosie dashboard. Patient management is coming next.
      </p>
    </div>
  )
}