import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems } from '../api/workitems.ts'
export function useWorkItems() {
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [itemsError, setItemsError] = useState('')
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
    }, [])
    return { workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError, setItemsError }
}