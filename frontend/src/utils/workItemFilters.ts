import type { WorkItem, WorkItemStatus, WorkItemPriority } from "../api/workitems"
import type { DeadlinePar } from '../pages/WorkItemPage'

export type DeadLineFilter = {
    item: WorkItem,
    deadlineFilter: DeadlinePar,
    today: string,
    range_seven_days: string,
    topSelector:  'All' | WorkItemStatus,
    prioritySelector: 'All' | WorkItemPriority,
    searchValue: string

}


export function matchesDeadlineFilter(value: DeadLineFilter): boolean {
    const matchesDeadline =
        value.deadlineFilter === 'All' ||
        (value.item.due_date !== null &&
            value.item.status !== 'DN' &&
            (
                (value.deadlineFilter === 'OD' && value.item.due_date < value.today) ||
                (value.deadlineFilter === 'DT' && value.item.due_date === value.today) ||
                (value.deadlineFilter === 'ND' &&
                    value.item.due_date > value.today &&
                    value.item.due_date <= value.range_seven_days)
            ))
    const matchesFilters =
        (value.topSelector === 'All' || value.item.status === value.topSelector) &&
        (value.prioritySelector === 'All' || value.item.priority === value.prioritySelector) &&
        value.item.title.toLowerCase().includes(value.searchValue.trim().toLowerCase()) &&
        matchesDeadline
    return matchesFilters

}   