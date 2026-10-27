import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems, patchWorkitems, postWorkItems } from '../api/workitems.ts'
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
    async function handleSaveStatus(itemId: number) {
        const selectedStatus = draftStatuses[itemId]

        if (!selectedStatus) return

        setItemsError('')
        setSavingItemId(itemId);

        try {
            const updatedItem = await patchWorkitems(itemId, selectedStatus)

            setWorkItems((previousItems) =>
                previousItems.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item,
                ),
            )

            setDraftStatuses((previous) => {
                const remaining = { ...previous }

                delete remaining[itemId]
                return remaining
            })
        } catch (error) {
            setItemsError(
                error instanceof Error ? error.message : 'Failed to update status',
            )
        } finally {
            setSavingItemId(null);
        }

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

    async function createWorkItem(title: string, description: string) {
        setCreatingItem(true);
        setCreateError('')
        try {
            const newItem = await postWorkItems(title, description)
            setWorkItems((previousItems) => [...previousItems, newItem])
            setTitle('')
            setDescription('')
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


    return {
        workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError,
        setItemsError, creatingItem, setCreatingItem, createError, setCreateError,
        savingItemId, setSavingItemId, draftStatuses, setDraftStatuses, handleStatusChange, handleSaveStatus
    }
}