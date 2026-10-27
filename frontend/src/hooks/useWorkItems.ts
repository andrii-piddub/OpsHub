import { useState } from "react";
import type { WorkItem } from '../api/workitems.ts';
export function useWorkItems() {
    const [workItems, setWorkItems] = useState<WorkItem[]>([])
    const [itemsLoading, setItemsLoading] = useState(true)
    return { workItems, setWorkItems, itemsLoading, setItemsLoading }
}