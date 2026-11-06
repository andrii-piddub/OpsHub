import WorkItemPage from "./pages/WorkItemPage"
import { useState, useEffect } from "react"
import LoginForm from './components/LoginForm'
import type {User} from './api/auth.ts'
import {authMe} from './api/auth.ts'
import RegisterForm from "./components/RegisterForm.tsx"

function App(){
  const [user, setUser]=useState<User |null>(null)
  const [authLoading,setAuthLoading]=useState(true)
  const [authError, setAuthError]=useState('')
  const [createAccount, setCreateAccount]=useState(false)
  
  useEffect(() => {
    let active = true
    async function checkSession() {
      try {
        const currentUser = await authMe()
        if (active) setUser(currentUser)
      } catch (error) {
        if (!active) return
        setUser(null)
        if (!(error instanceof Error) || error.message !== 'Request failed: 403') {
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
  
  
  return(<>
  {authLoading && (
    <div className="auth-screen">
      <section className="auth-card auth-loading" role="status" aria-live="polite">
        <span className="auth-spinner" aria-hidden="true" />
        <h1>OpsHub</h1>
        <p>Loading your workspace…</p>
      </section>
    </div>
  )}
  {!authLoading && user && <WorkItemPage user={user} getUser={setUser}/>}
  {!authLoading && !user && <div className="auth-screen"><LoginForm getUser={setUser} createAccount={createAccount} setCreateAccount={setCreateAccount}/></div>}
  {!authLoading && !user && createAccount && <RegisterForm />}

  </>)
}

export default App
