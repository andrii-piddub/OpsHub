import { useState } from "react";
import type {WorkItem} from '../api/workitems.ts'
export function useWorkItems() {
    return (const [workItems, setWorkItems] = useState<WorkItem[]>([]))

}