// import type { WorkItemStatus } from '../api/workitems'
// import type { WorkItemOrdering, WorkItemPriority } from "../api/workitems.ts";
// import { authMe } from "../api/auth.ts";
// import type { User } from "../api/auth.ts";
// import { ApiErrors } from '../api/ApiError.ts'
// import { useWorkItemDraft } from './useWorkItemDraft.ts'
// import {useWorkItemsList} from './useWorkItemsList.ts'
// import { useWorkItemMutations } from "./useWorkItemMutations.ts";
// import type {PrioritySortSelectorPar, DeadlinePar} from "../pages/WorkItemPage.tsx"
// import {useWorkItemStats} from './useWorkItemStats.ts'
// export type WorkItemsParam = {
//     retryCount?: number;
//     topSelector: 'All' | WorkItemStatus;
//     searchValue: string;
//     orderingType: WorkItemOrdering;
//     prioritySelector:'All'| WorkItemPriority;
//     page: number;
//     setPage: (page: number) => void;
//     setSessionOver: (value: boolean) => void;
//     getUser: (value: User | null) => void;
//     setPriority:(value:WorkItemPriority)=>void;
//     prioritySortSelector:PrioritySortSelectorPar;
//     setDueDate:(value:string|null)=>void;
//     deadlineFilter:DeadlinePar;


// }


// export function useWorkItems({ retryCount = 0, topSelector, prioritySelector, searchValue, orderingType, page, setPage, setSessionOver, getUser, setPriority, prioritySortSelector, setDueDate, deadlineFilter }: WorkItemsParam) {

//     // ===== STATE =====


//     const draftManager = useWorkItemDraft()
//     const workItemListManager = useWorkItemsList({retryCount, topSelector, searchValue, orderingType, page, prioritySelector, prioritySortSelector, deadlineFilter})
//     const mutationManager = useWorkItemMutations({draftManager, topSelector, searchValue, workItemListManager, page, setPage,  handleErrors, setPriority, prioritySelector, setDueDate, deadlineFilter})









//     // ===== RETURN =====
//     return {
//         workItemListManager, draftManager, mutationManager, 
//     }
// }
