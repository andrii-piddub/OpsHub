import { Navigate, Outlet } from 'react-router'
import type { User } from '../api/auth'

type RequireAuthProps = {
  authLoading: boolean
  user: User | null
}

export function RequireAuth(props: RequireAuthProps) {
  if (props.authLoading) {
    return (
      <div className="auth-screen">
        <section className="auth-card auth-loading" role="status" aria-live="polite">
          <span className="auth-spinner" aria-hidden="true" />
          <h1>OpsHub</h1>
          <p>Loading your workspace…</p>
        </section>
      </div>
    )
  }

  if (!props.user) return <Navigate to="/login" replace />
  return <Outlet />
}
