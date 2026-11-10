import type { WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering } from "../api/workitems.ts";
import { authMe } from "../api/auth.ts";
import type { User } from "../api/auth.ts";
import { ApiErrors } from '../api/ApiError.ts'
import { useWorkItemDraft } from './useWorkItemDraft.ts'
import {useWorkItemsList} from './useWorkItemsList.ts'
import { useWorkItemMutations } from "./useWorkItemMutations.ts";
export type WorkItemsParam = {
    retryCount?: number;
    topSelector: 'All' | WorkItemStatus;
    searchValue: string;
    orderingType: WorkItemOrdering;
    page: number;
    setPage: (page: number) => void;
    setSessionOver: (value: boolean) => void;
    getUser: (value: User | null) => void;

}


export function useWorkItems({ retryCount = 0, topSelector, searchValue, orderingType, page, setPage, setSessionOver, getUser }: WorkItemsParam) {

    // ===== STATE =====


    const draftManager = useWorkItemDraft()
    const workItemListManager = useWorkItemsList({retryCount, topSelector, searchValue, orderingType, page, handleErrors})
    const mutationManager = useWorkItemMutations({draftManager, topSelector, searchValue, workItemListManager, page, setPage,  handleErrors})


    async function handleErrors(
        error: unknown,
        signal?: AbortSignal,
    ): Promise<void> {
        if (error instanceof ApiErrors && error.status === 403) {
            try {
                if (signal?.aborted) return
                await authMe()
            } catch (error) {
                if (signal?.aborted) return
                const err2 = error as { status?: number }
                if (err2.status === 403) {
                    setSessionOver(true)
                    getUser(null)
                }
            }
        }

    }







    // ===== RETURN =====
    return {
        workItemListManager, draftManager, mutationManager
    }
}
