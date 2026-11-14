import type { DashboardStats } from "../api/workItemStats";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/workItemStats";
import type { useWorkItemMutations } from "./useWorkItemMutations"
type WorkItemStatsParams = {
    mutationManager: ReturnType<typeof useWorkItemMutations>;
    handleErrors: (
        error: unknown, signal?: AbortSignal) => Promise<void>;
};

export function useWorkItemStats(props: WorkItemStatsParams) {
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [dashboardErrors, setDashboardErrors] = useState('')
    const [dashboardLoading, setDashboardLoading] = useState(true)
    useEffect(() => {
        const controller = new AbortController()
        async function checkDashboardStats() {
            setDashboardErrors('');
            setDashboardLoading(true)
            try {
                const data = await getDashboardStats(controller.signal)
                setDashboardStats(data)

            } catch (error) {
                if (controller.signal.aborted) return
                await props.handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                setDashboardErrors(
                    error instanceof Error ? error.message : 'Failed to load dashboards',
                )
            } finally {
                if (!controller.signal.aborted){
                    setDashboardLoading(false)
                }
            }
        }
        checkDashboardStats()
        return (() => {
            controller.abort()
        })
    }, [props.mutationManager.patchCount])
    return { dashboardStats, dashboardErrors, dashboardLoading }
}