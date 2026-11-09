import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems, patchWorkitems, postWorkItems, deleteWorkItem } from '../api/workitems.ts'
import type { WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering, PaginationInfo } from "../api/workitems.ts";
import { authMe } from "../api/auth.ts";
import type { User } from "../api/auth.ts";
import { ApiErrors } from '../api/ApiError.ts'
import {useWorkItemDraft} from './useWorkItemDraft.ts'

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
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({ 'count': 1, 'num_pages': 1, 'current_page': 1, 'next': null, 'previous': null })
    const [itemsError, setItemsError] = useState('')
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const draftManager = useWorkItemDraft()


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

            if (leavesFilter && workItems.length === 1 && page > 1) {
                setPage(page - 1)
            } else {
                setRefreshKey(prev => prev + 1)
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
            if (page > 1 && workItems.length === 1) {
                setPage(page - 1)
            }
            draftManager.cancelEditing()
            
            setRefreshKey(prev => prev + 1)
        } catch (error) {
            await handleErrors(error)

            setItemsError(
                error instanceof ApiErrors ? error.message : 'Failed to delete item',
            )
        } finally {
            setDeletingItemId(null)
        }
    }


    // ===== useEffect: load work items =====
    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setItemsLoading(true);
            setItemsError('');
            setWorkItems([]);
            try {
                const data = await getWorkItems(controller.signal, topSelector, searchValue, orderingType, page)
                setWorkItems(data.results)
                setPaginationInfo({
                    count: data.count, num_pages: data.num_pages, current_page: data.current_page,
                    next: data.next, previous: data.previous
                })
            } catch (error) {
                if (controller.signal.aborted) return
                await handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                setItemsError(
                    error instanceof Error ? error.message : 'Failed to load message',
                )
            } finally {
                if (!controller.signal.aborted) {
                    setItemsLoading(false)
                }
            }
        }
        checkWorkItem()
        return (() => {
            controller.abort()
        })
    }, [retryCount, topSelector, searchValue, orderingType, page, refreshKey])


    // ===== createWorkItem =====
    async function createWorkItem(title: string, description: string) {
        setCreatingItem(true);
        setCreateError('')
        try {
            const newItem = await postWorkItems(title, description)
            if ((newItem.status === topSelector || topSelector === 'All') && (searchValue === "" || newItem.title.toLowerCase().includes(searchValue.toLowerCase()))) {
                setRefreshKey(prev => prev + 1)
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
        workItems, itemsLoading, itemsError, creatingItem, createError,
        savingItemId, handleSaveAction,
        createWorkItem, handleDeleteWorkItem, deletingItemId, paginationInfo, draftManager,
    }
}
