import { Outlet } from 'react-router'
import type { User } from '../api/auth'
import { useAppLayout } from '../hooks/useAppLayout'
import { NavLink } from "react-router";


export type RequireAuthProps = {
  authLoading: boolean
  user: User | null
  setUser: (value: User | null) => void
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
        <p>{props.user && `Welcome ${props.user.username}`}</p>
        <p>{appLayoutManager.error}</p>
      </header>
      <div className='main-workspace'>
        <aside className="sidebar">
          <header>Workspace</header>
          <nav className='sidebar-panel'>
            <NavLink className="sidebar-option1" to='/dashboard'>Dashboard</NavLink>
            <NavLink className="sidebar-option2" to='/workitem' end>Work items</NavLink>
            <NavLink className="sidebar-option3" to='/workitem/create'>Create Item</NavLink>
            <NavLink className="sidebar-option4" to='/settings/'>Settings</NavLink>
            <NavLink className="sidebar-option5" to='/supportcases/'>Support Cases</NavLink>
            <NavLink className="sidebar-option6" to='/supportcases/create'>Create Support Case</NavLink>



          </nav>
        </aside>
        <div className='main-content'>
          <Outlet />
        </div>

      </div>

    </div>
  )
}