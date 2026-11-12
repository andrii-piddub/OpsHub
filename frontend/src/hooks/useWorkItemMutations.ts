import { useState } from "react"
import { patchWorkitems, postWorkItems, deleteWorkItem } from '../api/workitems.ts'
import type { useWorkItemDraft } from './useWorkItemDraft.ts'
import type { useWorkItemsList } from './useWorkItemsList.ts'
import type { WorkItemStatus, WorkItemPriority } from "../api/workitems.ts"
import { ApiErrors } from '../api/ApiError'


export type WorkItemMutationParam = {
    draftManager: ReturnType<typeof useWorkItemDraft>
    topSelector: 'All' | WorkItemStatus
    searchValue: string
    workItemListManager: ReturnType<typeof useWorkItemsList>
    page: number
    setPage: (value: number) => void
    handleErrors: (error: unknown,
        signal?: AbortSignal) =>  Promise<void>;
    setPriority:(value:WorkItemPriority)=>void,
    prioritySelector:'All'| WorkItemPriority

}


export function useWorkItemMutations(props: WorkItemMutationParam) {
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
    const [itemsError, setItemsError] = useState('')




    async function handleSaveAction(itemId: number) {
        if (props.draftManager.draft.draftId!==itemId) return
        setItemsError('')
        setSavingItemId(itemId);

        try {
            const updatedItem = await patchWorkitems(itemId, props.draftManager.draft.draftStatus, props.draftManager.draft.draftTitle, props.draftManager.draft.draftDescription, props.draftManager.draft.draftPriority)
            props.draftManager.cancelEditing()
            const leavesFilter = ((props.topSelector !== 'All' && updatedItem.status !== props.topSelector) || (props.prioritySelector !== 'All'  && updatedItem.priority !==props.prioritySelector)) || !updatedItem.title.toLowerCase().includes(props.searchValue.toLowerCase())

            if (leavesFilter && props.workItemListManager.workItems.length === 1 && props.page > 1) {
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


    async function createWorkItem(title: string, description: string, priority:WorkItemPriority) {
        setCreatingItem(true);
        setCreateError('')
        try {
            const newItem = await postWorkItems(title, description, priority)
            props.setPriority('ME')
            if (((newItem.status === props.topSelector || props.topSelector === 'All')&&(newItem.priority === props.prioritySelector || props.prioritySelector === 'All' )) && (props.searchValue === "" || newItem.title.toLowerCase().includes(props.searchValue.toLowerCase()))) {
                props.workItemListManager.refresh()
            }
            return true
        } catch (error) {
            await props.handleErrors(error)
            setCreateError(
                error instanceof ApiErrors
                    ? error.message
                    : 'Failed to create WorkItem',
            )
        } finally {
            setCreatingItem(false)

        }
    }
    return { handleSaveAction, createWorkItem, handleDeleteWorkItem, creatingItem, createError, savingItemId, deletingItemId, itemsError }
}