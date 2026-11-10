import { useState } from "react";
import {  patchWorkitems, postWorkItems, deleteWorkItem } from '../api/workitems.ts'
import type { WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering } from "../api/workitems.ts";
import { authMe } from "../api/auth.ts";
import type { User } from "../api/auth.ts";
import { ApiErrors } from '../api/ApiError.ts'
import { useWorkItemDraft } from './useWorkItemDraft.ts'
import {useWorkItemsList} from './useWorkItemsList.ts'

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

    const [itemsError, setItemsError] = useState('')
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const draftManager = useWorkItemDraft()
    const workItemListManager = useWorkItemsList({retryCount, topSelector, searchValue, orderingType, page, handleErrors})


    const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

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




    // ===== handleSaveAction =====
    async function handleSaveAction(itemId: number) {
        if (!draftManager.draft.draftId) return
        setItemsError('')
        setSavingItemId(itemId);

        try {
            const updatedItem = await patchWorkitems(itemId, draftManager.draft.draftStatus, draftManager.draft.draftTitle, draftManager.draft.draftDescription, draftManager.draft.draftPriority)
            draftManager.cancelEditing()
            const leavesFilter = (topSelector !== 'All' && updatedItem.status !== topSelector) || !updatedItem.title.toLowerCase().includes(searchValue.toLowerCase())

            if (leavesFilter && workItemListManager.workItems.length === 1 && page > 1) {
                setPage(page - 1)
            } else {
                workItemListManager.refresh()
            }


        } catch (error) {
            await handleErrors(error)
            setItemsError(
                error instanceof ApiErrors ? error.message : 'Failed to update status',
            )
        } finally {
            setSavingItemId(null)
        }

    }


    // ===== handleDeleteWorkItem =====
    async function handleDeleteWorkItem(id: number) {
        try {
            setItemsError('');
            setDeletingItemId(id);
            await deleteWorkItem(id)
            if (page > 1 && workItemListManager.workItems.length === 1) {
                setPage(page - 1)
            }else {
                workItemListManager.refresh()
            }
            if (draftManager.draft.draftId === id) {
                draftManager.cancelEditing()
            }

        } catch (error) {
            await handleErrors(error)

            setItemsError(
                error instanceof ApiErrors ? error.message : 'Failed to delete item',
            )
        } finally {
            setDeletingItemId(null)
        }
    }

    // ===== createWorkItem =====
    async function createWorkItem(title: string, description: string) {
        setCreatingItem(true);
        setCreateError('')
        try {
            const newItem = await postWorkItems(title, description)
            if ((newItem.status === topSelector || topSelector === 'All') && (searchValue === "" || newItem.title.toLowerCase().includes(searchValue.toLowerCase()))) {
                workItemListManager.refresh()
            }
            return true
        } catch (error) {
            await handleErrors(error)
            setCreateError(
                error instanceof ApiErrors
                    ? error.message
                    : 'Failed to create WorkItem',
            )
        } finally {
            setCreatingItem(false)

        }
    }


    // ===== RETURN =====
    return {
        workItemListManager, itemsError, creatingItem, createError,
        savingItemId, handleSaveAction,
        createWorkItem, handleDeleteWorkItem, deletingItemId, draftManager,
    }
}
