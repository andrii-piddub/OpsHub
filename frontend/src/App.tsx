import WorkItemPage from "./pages/WorkItemPage"
import { useState, useEffect, useRef } from "react"
import LoginForm from './components/LoginForm'
import type { User } from './api/auth.ts'
import { authMe } from './api/auth.ts'
import RegisterForm from "./components/RegisterForm.tsx"
import { Route, Routes } from "react-router"
import {RequireAuth} from "./components/RequireAuth.tsx"
import { Navigate } from "react-router"
function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [sessionOver, setSessionOver] = useState(false)
  const sessionDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let active = true
    async function checkSession() {
      try {
        const currentUser = await authMe()
        if (active) setUser(currentUser)
      } catch (error) {
        if (!active) return
        setUser(null)
        const err = error as { status?: number }
        if (err.status !== 403) {
          setAuthError('Не вдалося перевірити сесію. Спробуй оновити сторінку.')
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    }
    checkSession()
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    if (sessionOver) {
      sessionDialog.current?.showModal()
    }
  }, [sessionOver])

  if (!authLoading && authError) {
    return (
      <div className="auth-screen">
        <section className="auth-card" role="alert">
          <h1>OpsHub</h1>
          <p>{authError}</p>
          <button className="auth-submit" type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </section>
      </div>
    )
  }


  return (<>
    <dialog ref={sessionDialog} className="session-dialog" aria-labelledby="session-title" aria-describedby="session-description" onClose={() => setSessionOver(false)}>
      <div className="session-dialog__icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <p className="session-dialog__brand">OpsHub</p>
      <h2 id="session-title">Session is over</h2>
      <p id="session-description">Please log in again to continue with your workspace.</p>
      <form method="dialog">
        <button className="session-dialog__button" autoFocus>OK, back to login</button>
      </form>
    </dialog>
    {authLoading && (
      <div className="auth-screen">
        <section className="auth-card auth-loading" role="status" aria-live="polite">
          <span className="auth-spinner" aria-hidden="true" />
          <h1>OpsHub</h1>
          <p>Loading your workspace…</p>
        </section>
      </div>
    )}
    <Routes>
        <Route path="/login" element={<LoginForm getUser={setUser} />} />
        <Route path="/register" element={<RegisterForm />} />
      <Route element={<RequireAuth authLoading={authLoading} user={user} />}>
        <Route path="/workitem" element={<WorkItemPage user={user} getUser={setUser} sessionOver={sessionOver} setSessionOver={setSessionOver}/>} />
        <Route path="/" element={<Navigate to="/workitem" replace />} />
      </Route>
    </Routes>


  </>)
}

export default App
