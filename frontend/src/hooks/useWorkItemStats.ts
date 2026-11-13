import type { DashboardStats } from "../api/workItemStats";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/workItemStats";
import type {useWorkItemMutations} from "./useWorkItemMutations"
import type {useWorkItemsList} from "./useWorkItemsList"
type WorkItemStatsParams = {
  mutationManager: ReturnType<typeof useWorkItemMutations>;
    handleErrors: (
    error: unknown, signal?: AbortSignal) => Promise<void>;
    workItemListManager: ReturnType<typeof useWorkItemsList >;
};

export function useWorkItemStats(props:WorkItemStatsParams) {
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [dashboardErrors, setDashboardErrors] = useState('')
    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setDashboardErrors('');
            try {
                const data = await getDashboardStats(controller.signal)
                setDashboardStats(data)

            } catch (error) {
                if (controller.signal.aborted) return
                await props.handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                props.workItemListManager.setListErrors(
                    error instanceof Error ? error.message : 'Failed to load message',
                )
            } finally {
                if (!controller.signal.aborted) {
                    props.workItemListManager.setItemsLoading(false)
                }
            }
        }
        checkWorkItem()
        return (() => {
            controller.abort()
        })
    }, [props.mutationManager.patchCount])
    return {dashboardStats}
}