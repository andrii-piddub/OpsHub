import { Outlet } from 'react-router'
import type { User } from '../api/auth'
import { useAppLayout } from '../hooks/useAppLayout'
import { NavLink } from "react-router";
import opshubLogo from '../assets/opshub-logo.png'
import {useCurrenciesandIndices} from '../hooks/useCurrenciesAndIndices'
import {MarketOverviewBar} from './MarketOverviewBar'

export type RequireAuthProps = {
  authLoading: boolean
  user: User | null
  setUser: (value: User | null) => void
  handleErrors:(error: unknown,
        signal?: AbortSignal) => Promise<void>;
}

export function AppLayout(props: RequireAuthProps) {
  const appLayoutManager = useAppLayout(props.setUser)
  const marketOverviewManager = useCurrenciesandIndices(props.handleErrors)
  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="workspace-header-logo">
          <img className="workspace-logo" src={opshubLogo} alt="OpsHub" />
        </div>
        <MarketOverviewBar marketOverviewManager={marketOverviewManager} />
        <div className="workspace-header-logout">

          <button
            className="logout-button"
            type="button"
            onClick={() => { appLayoutManager.logoutRequest() }}
            disabled={appLayoutManager.logouting}
          >Logout</button>
        <p>{props.user && `Welcome ${props.user.username}`}</p>
        </div>
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
