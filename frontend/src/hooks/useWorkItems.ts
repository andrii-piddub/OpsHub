import { useState, useEffect } from "react";
import type { WorkItem } from '../api/workitems.ts';
import {getWorkItems} from '../api/workitems.ts'
export function useWorkItems() {
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [itemsError, setItemsError] = useState('')
    useEffect(()=>{const controller = new AbortController()},[])
    return { workItems, setWorkItems, itemsLoading, setItemsLoading, itemsError, setItemsError}
}