import { Navigate, Outlet } from 'react-router'
import type { RequireAuthProps } from './RequireAuth'


export function GuestRoute(props: RequireAuthProps) {
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
  if (props.user) return <Navigate to="/workitem" replace />
  return <Outlet />
}