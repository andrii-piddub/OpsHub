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
    handleErrors: (error: unknown,
        signal?: AbortSignal) =>  Promise<void>;
}

export function useWorkItemsList(props: WorkItemListParam) {
    const [itemsLoading, setItemsLoading] = useState(true)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({ 'count': 1, 'num_pages': 1, 'current_page': 1, 'next': null, 'previous': null })
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [listErrors, setListErrors]= useState('')
    function refresh(){
        setRefreshKey(prev => prev + 1)
    }
    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setItemsLoading(true);
            setListErrors('');
            setWorkItems([]);
            try {
                const data = await getWorkItems(controller.signal, props.topSelector, props.searchValue, props.orderingType, props.page)
                setWorkItems(data.results)
                setPaginationInfo({
                    count: data.count, num_pages: data.num_pages, current_page: data.current_page,
                    next: data.next, previous: data.previous
                })
            } catch (error) {
                if (controller.signal.aborted) return
                await props.handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                setListErrors(
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
    }, [props.retryCount, props.topSelector, props.searchValue, props.orderingType, props.page, refreshKey])

    return{workItems, refreshKey,  itemsLoading,paginationInfo, listErrors, refresh

    }
}
