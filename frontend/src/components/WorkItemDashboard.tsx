import type { useWorkItemStats } from '../hooks/useWorkItemStats'


function WorkItemDashboard({dashboardManager,}: {dashboardManager: ReturnType<typeof useWorkItemStats>;}) {
    return (<>
        <div className="wrapper">
            <div className="rectangle1">
                <label className="label">Total</label>
                <span className="value">{dashboardManager.dashboardStats?.dashboard_total ?? ''}</span>
            </div>
            <div className="rectangle2">
                <label className="label">Open</label>
                <span className="value">{dashboardManager.dashboardStats?.dashboard_open ?? ''}</span>

            </div>
            <div className="rectangle3">
                <label className="label">In Progress</label>
                <span className="value">{dashboardManager.dashboardStats?.dashboard_in_progress ?? ''}</span>
            </div>
            <div className="rectangle4">
                <label className="label">Done</label>
                <span className="value">{dashboardManager.dashboardStats?.dashboard_done ?? ''}</span>
            </div>
            <div className="rectangle5">
                <label className="label">High Priority</label>
                <span className="value">{dashboardManager.dashboardStats?.dashboard_high_priority ?? ''}</span>
            </div>
            <div className="rectangle6">
                <label className="label">Overdue</label>
                <span className='value'>{dashboardManager.dashboardStats?.dashboard_overdue ?? ''}</span>
            </div>
        </div>
    </>)
}

export default WorkItemDashboard