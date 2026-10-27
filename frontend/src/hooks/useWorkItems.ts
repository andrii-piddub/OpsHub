import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems, patchWorkitems } from '../api/workitems.ts'
import type { WorkItemStatus } from '../api/workitems'
export function useWorkItems(retryCount: number = 0) {
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [itemsError, setItemsError] = useState('')
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const [draftStatuses, setDraftStatuses] = useState<
        Record<number, WorkItemStatus>
    >({})
    const handleStatusChange = (itemId: number, status: WorkItemStatus) => {
        setDraftStatuses((previous) => ({
            ...previous,
            [itemId]: status,
        }))
    }
    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setItemsLoading(true);
            setItemsError('');
            setWorkItems([]);
            try {
                const data = await getWorkItems(controller.signal)
                setWorkItems(data)
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
    }, [retryCount])
    return {
        workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError,
        setItemsError, creatingItem, setCreatingItem, createError, setCreateError,
        savingItemId, setSavingItemId, draftStatuses, setDraftStatuses, handleStatusChange
    }
}