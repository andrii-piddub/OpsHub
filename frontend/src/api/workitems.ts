import {ApiErrors} from './ApiError'
import {getCsrfToken} from './auth'
import type {PrioritySortSelectorPar} from '../pages/WorkItemPage'
export type WorkItemStatus = 'OP' | 'IP' | 'DN'
export type WorkItemPriority = 'LO' | 'ME' | 'HI'
export type WorkItem = {
  id: number;
  title: string;
  description: string;
  priority: WorkItemPriority;
  status: WorkItemStatus
  created_at: string
  due_date:string | null;
}

export type WorkItemsResponse = {
  results: WorkItem[];
  count: number;
  num_pages: number;
  current_page: number;
  next: number | null;
  previous: number | null;

}
export type PaginationInfo = Omit<WorkItemsResponse, 'results'>

export type WorkItemOrdering = 'created_at' | '-created_at'
export async function getWorkItems(signal: AbortSignal, topSelector: 'All' | WorkItemStatus, prioritySelector:'All'|WorkItemPriority, prioritySortSelector:PrioritySortSelectorPar, searchValue: string, orderingType: WorkItemOrdering, page: number): Promise<WorkItemsResponse> {
  const url = new URL('/api/v1/workitem/', window.location.origin)
  const params = new URLSearchParams(url.search)
  if (topSelector && topSelector != 'All') {
    params.append('status', topSelector)
  }
  if (searchValue) {
    params.append('search', searchValue)
  }
  if (orderingType) {
    params.append('ordering', orderingType)
  }
  if (prioritySortSelector){
    params.append('priority_sort',prioritySortSelector)
  }
  if (prioritySelector && prioritySelector !='All'){
    params.append('priority',prioritySelector)
  }
  if (page) {
    params.append('page', String(page))
  }
  url.search = params.toString()

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`,response.status )
  }
  return (await response.json()) as WorkItemsResponse
}

export async function postWorkItems(title: string, description: string, priority:WorkItemPriority) {
  const response = await fetch(
    '/api/v1/workitem/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()?? ''
      },
      body: JSON.stringify({ title: title, description: description, priority:priority }),
    },
  )

  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`,response.status )
  }
  return (await response.json()) as WorkItem
}

export async function patchWorkitems(
  id: number,
  status: WorkItemStatus,
  title: string,
  description: string,
  priority: WorkItemPriority,
  due_date:string | null,
): Promise<WorkItem> {
  const response = await fetch(
    `/api/v1/workitem/${id}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()?? ''
      },
      body: JSON.stringify({ title: title, status: status, description: description, priority: priority, due_date:due_date }),
    },
  )

  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status )

  }
  return (await response.json()) as WorkItem
}

export async function deleteWorkItem(
  id: number,
): Promise<void> {
  const url = `/api/v1/workitem/${id}/`
  const response = await fetch(url, {
    method: 'DELETE', headers: {
      'X-CSRFToken': getCsrfToken()?? ''
    }
  })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status )
  }
}
