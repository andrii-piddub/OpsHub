import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems, patchWorkitems, postWorkItems, deleteWorkItem } from '../api/workitems.ts'
import type { WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering, PaginationInfo } from "../api/workitems.ts";


export function useWorkItems(retryCount: number = 0, topSelector: 'All' | WorkItemStatus, searchValue: string, orderingType: WorkItemOrdering, page: number, setPage: (page: number) => void) {

    // ===== STATE =====
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({ 'count': 1, 'num_pages': 1, 'current_page': 1, 'next': null, 'previous': null })
    const [itemsError, setItemsError] = useState('')
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const [editingItemId, setEditingItemId] = useState<number | null>(null)
    const [draftTitle, setDraftTitle] = useState('')
    const [draftDescription, setDraftDescription] = useState("")
    const [draftStatus, setDraftStatus] = useState<WorkItemStatus>('OP')

    const [deletingItemId, setDeletingItemId] = useState<number | null>(null)



    // ===== handleSaveAction =====
    async function handleSaveAction(itemId: number) {
        if (!editingItemId) return
        setItemsError('')
        setSavingItemId(itemId);

        try {
            const updatedItem = await patchWorkitems(itemId, draftStatus, draftTitle, draftDescription)

            const leavesFilter = topSelector !== 'All' && updatedItem.status !== topSelector

            if (leavesFilter && workItems.length === 1 && page > 1) {
                setPage(page - 1)
            } else {
                setRefreshKey(prev => prev + 1)
            }


        } catch (error) {
            setItemsError(
                error instanceof Error ? error.message : 'Failed to update status',
            )
        } finally {
            setSavingItemId(null);

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

            setRefreshKey(prev => prev + 1)
        } catch (error) {
            setItemsError(
                error instanceof Error ? error.message : 'Failed to delete item',
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

                setItemsError(
                    error instanceof Error
                        ? error.message
                        : 'Did not receive an answer',
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
            setCreateError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create WorkItem',
            )
        } finally {
            setCreatingItem(false)

        }
    }


    // ===== RETURN =====
    return {
        workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError,
        setItemsError, creatingItem, setCreatingItem, createError, setCreateError,
        savingItemId, setSavingItemId,  handleSaveAction,
        createWorkItem, handleDeleteWorkItem, deletingItemId, paginationInfo, editingItemId, setEditingItemId, draftTitle, setDraftTitle, draftDescription, setDraftDescription, draftStatus, setDraftStatus
    }
}
