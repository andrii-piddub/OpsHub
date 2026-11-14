import { Outlet } from 'react-router'
import type { User } from '../api/auth'
import { useAppLayout } from '../hooks/useAppLayout'


export type RequireAuthProps = {
  authLoading: boolean
  user: User | null
  setUser:(value:User|null)=>void
}

export function AppLayout(props: RequireAuthProps) {
  const appLayoutManager = useAppLayout(props.setUser)
  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="workspace-header">
          <h1>OpsHub</h1>
          <button
            className="logout-button"
            type="button"
            onClick={() => { appLayoutManager.logoutRequest() }}
            disabled={appLayoutManager.logouting}
          >Logout</button>
        </div>
        {/* <p>{user && `Welcome ${user.username}`}</p> */}

        {/* ===== Health check ===== */}
        {/* <button
          type="button"
          onClick={() => setRetryCount((previous) => previous + 1)}
          disabled={loading || workItemListManager.itemsLoading}
        >
          {loading || workItemListManager.itemsLoading ? 'Checking' : 'Checking again'}
        </button>

        {loading && <p>Checking connection with server</p>}
        {error && <p role="alert">Error: {error}</p>}

        {health && (
          <div>
            <p>Сервіс: {health.service}</p>
            <p>Статус: {health.status}</p>
          </div> */}
        {/* )} */}
      </header>
      <div className='main-workspace'>
        <aside className="sidebar">
          <header>Workspace</header>
          <nav className='sidebar-panel'>
            <a className="sidebar-option1" href='/dashboard'>Dashboard</a>
            <a className="sidebar-option2" href='/workitem'>Work items</a>
            <a className="sidebar-option3" href='/workitem/create'>Create Item</a>
          </nav>
        </aside>
        <div className='main-content'>
          <Outlet />
        </div>

      </div>

    </div>
  )
}