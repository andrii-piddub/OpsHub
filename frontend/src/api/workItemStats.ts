import { ApiErrors } from "./ApiError"
export type DashboardStats = {
    dashboard_total: number,
    dashboard_open: number,
    dashboard_in_progress: number,
    dashboard_done: number,
    dashboard_high_priority: number,
    dashboard_overdue: number
}

export async function getDashboardStats(signal: AbortSignal): Promise<DashboardStats>  {
    const url = new URL('/api/v1/workitem/stats/', window.location.origin)
    const response = await fetch(url, { signal })
    if (!response.ok) {
        throw new ApiErrors(`Request failed: ${response.status}`, response.status)
    }
    return (await response.json()) as DashboardStats
}