import { useState, useEffect } from "react"
import { getWorkItems } from '../api/workitems.ts'
import type { WorkItem, WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering, PaginationInfo } from "../api/workitems.ts";

export type WorkItemListParam = {
    retryCount: number,
    topSelector: 'All' | WorkItemStatus,
    searchValue: string,
    orderingType: WorkItemOrdering,
    page: number,
    refreshKey: number,
    setItemsError: (value: string) => void,
    setWorkItems: (value: WorkItem[]) => void,
    handleErrors: (error: unknown,
        signal?: AbortSignal) =>  Promise<void>;
}

export function useWorkItemsList(props: WorkItemListParam) {
    const [itemsLoading, setItemsLoading] = useState(true)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({ 'count': 1, 'num_pages': 1, 'current_page': 1, 'next': null, 'previous': null })
    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setItemsLoading(true);
            props.setItemsError('');
            props.setWorkItems([]);
            try {
                const data = await getWorkItems(controller.signal, props.topSelector, props.searchValue, props.orderingType, props.page)
                props.setWorkItems(data.results)
                setPaginationInfo({
                    count: data.count, num_pages: data.num_pages, current_page: data.current_page,
                    next: data.next, previous: data.previous
                })
            } catch (error) {
                if (controller.signal.aborted) return
                await props.handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                props.setItemsError(
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
    }, [props.retryCount, props.topSelector, props.searchValue, props.orderingType, props.page, props.refreshKey])

    return{itemsLoading,paginationInfo

    }
}
