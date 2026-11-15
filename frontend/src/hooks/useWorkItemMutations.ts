import { useState } from "react"
import { patchWorkitems, deleteWorkItem } from '../api/workitems.ts'
import type { useWorkItemDraft } from './useWorkItemDraft.ts'
import type { useWorkItemsList } from './useWorkItemsList.ts'
import type { WorkItemStatus, WorkItemPriority } from "../api/workitems.ts"
import { ApiErrors } from '../api/ApiError'
import type { DeadlinePar } from '../pages/WorkItemPage.tsx'
import { getBusinessDateRange } from '../utils/businessDate'
import { matchesDeadlineFilter } from '../utils/workItemFilters.ts'

export type WorkItemMutationParam = {
    draftManager: ReturnType<typeof useWorkItemDraft>
    topSelector: 'All' | WorkItemStatus
    searchValue: string
    workItemListManager: ReturnType<typeof useWorkItemsList>
    page: number
    setPage: (value: number) => void
    handleErrors: (error: unknown,
        signal?: AbortSignal) => Promise<void>;
    prioritySelector: 'All' | WorkItemPriority,
    deadlineFilter: DeadlinePar,

}


export function useWorkItemMutations(props: WorkItemMutationParam) {


    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
    const [itemsError, setItemsError] = useState('')



    async function handleSaveAction(itemId: number) {
        if (props.draftManager.draft.draftId !== itemId) return
        setItemsError('')
        setSavingItemId(itemId);
        const { today, range_seven_days } = getBusinessDateRange()
        try {
            const updatedItem = await patchWorkitems(itemId, props.draftManager.draft.draftStatus, props.draftManager.draft.draftTitle, props.draftManager.draft.draftDescription, props.draftManager.draft.draftPriority, props.draftManager.draft.draftDueDate)

            props.draftManager.cancelEditing()
            const matchesFilters = matchesDeadlineFilter({ item: updatedItem, deadlineFilter: props.deadlineFilter, today: today, range_seven_days: range_seven_days, topSelector: props.topSelector, prioritySelector: props.prioritySelector, searchValue: props.searchValue })
            if (!matchesFilters && props.workItemListManager.workItems.length === 1 && props.page > 1) {
                props.setPage(props.page - 1)
            } else {
                props.workItemListManager.refresh()
            }


        } catch (error) {
            await props.handleErrors(error)
            setItemsError(
                error instanceof ApiErrors ? error.message : 'Failed to update status',
            )
        } finally {
            setSavingItemId(null)
        }

    }





    async function handleDeleteWorkItem(id: number) {
        try {
            setItemsError('');
            setDeletingItemId(id);
            await deleteWorkItem(id)

            if (props.page > 1 && props.workItemListManager.workItems.length === 1) {
                props.setPage(props.page - 1)
            } else {
                props.workItemListManager.refresh()
            }
            if (props.draftManager.draft.draftId === id) {
                props.draftManager.cancelEditing()
            }

        } catch (error) {
            await props.handleErrors(error)

            setItemsError(
                error instanceof ApiErrors ? error.message : 'Failed to delete item',
            )
        } finally {
            setDeletingItemId(null)
        }
    }



    return { handleSaveAction, handleDeleteWorkItem, savingItemId, deletingItemId, itemsError }
}
