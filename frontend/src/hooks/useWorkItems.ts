import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import { getWorkItems, patchWorkitems, postWorkItems, deleteWorkItem } from '../api/workitems.ts'
import type { WorkItemStatus } from '../api/workitems'
import type { WorkItemOrdering, PaginationInfo  } from "../api/workitems.ts";



export function useWorkItems(retryCount: number = 0, topSelector:'All'|WorkItemStatus, searchValue:string, orderingType:WorkItemOrdering, page:number, setPage:(page:number)=>void) {
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({'count':1, 'num_pages':1,'current_page':1,'next':null, 'previous':null})
    const [itemsError, setItemsError] = useState('')
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const [savingItemId, setSavingItemId] = useState<number | null>(null)
    const [draftStatuses, setDraftStatuses] = useState<
        Record<number, WorkItemStatus>
    >({})
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
    const handleStatusChange = (itemId: number, status: WorkItemStatus) => {
        setDraftStatuses((previous) => ({
            ...previous,
            [itemId]: status,
        }))
    }
    async function handleSaveStatus(itemId: number) {
        const selectedStatus = draftStatuses[itemId]

        if (!selectedStatus ) return

        setItemsError('')
        setSavingItemId(itemId);

        try {
            const updatedItem = await patchWorkitems(itemId, selectedStatus)

                setWorkItems((previousItems) =>
                    (previousItems.map((item) =>
                        item.id === updatedItem.id ? updatedItem : item,
                    )).filter(element=>element.status===topSelector||topSelector==='All')
                )
                setRefreshKey(refreshKey+1)               


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
    async function handleDeleteWorkItem(id:number){
        try {
            setItemsError('');
            setDeletingItemId(id);
            await deleteWorkItem(id)
            if (page>1 && workItems.length===1){
                setPage(page-1)
            }

            setRefreshKey(prev=>prev+1)
        } catch (error) {
            setItemsError(
                error instanceof Error ? error.message : 'Failed to delete item',
            )
        } finally {
            setDeletingItemId(null)
        }
        }
    

    useEffect(() => {
        const controller = new AbortController()
        async function checkWorkItem() {
            setItemsLoading(true);
            setItemsError('');
            setWorkItems([]);
            try {
                const data = await getWorkItems(controller.signal, topSelector, searchValue, orderingType, page)
                setWorkItems(data.results)
                setPaginationInfo({count:data.count, num_pages:data.num_pages, current_page:data.current_page, 
                    next:data.next, previous:data.previous })
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
    }, [retryCount,topSelector,searchValue, orderingType, page, refreshKey])

    async function createWorkItem(title: string, description: string) {
        setCreatingItem(true);
        setCreateError('')
        try {
            const newItem = await postWorkItems(title, description)
            if ((newItem.status ===topSelector || topSelector==='All') && (searchValue==="" || newItem.title.toLowerCase().includes(searchValue.toLowerCase()))){
                setWorkItems((previousItems) =>(orderingType==='-created_at'?[newItem, ...previousItems ]: [...previousItems, newItem]))
                setPage(1)
                setRefreshKey(refreshKey+1)
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


    return {
        workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError,
        setItemsError, creatingItem, setCreatingItem, createError, setCreateError,
        savingItemId, setSavingItemId, draftStatuses, setDraftStatuses, handleStatusChange, handleSaveStatus,
        createWorkItem, handleDeleteWorkItem, deletingItemId, paginationInfo
    }
}