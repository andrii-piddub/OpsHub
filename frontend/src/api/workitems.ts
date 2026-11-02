export type WorkItemStatus = 'OP' | 'IP' | 'DN'
export type WorkItem = {
  id: number;
  title: string;
  description: string;
  status: WorkItemStatus
  created_at: string
}

export type WorkItemsResponse = {
  results:WorkItem[];
  count:number;
  num_pages:number;
  current_page:number;
  next:number | null;
  previous: number | null;

}
export type PaginationInfo = Omit<WorkItemsResponse, 'results'>

export type WorkItemOrdering = 'created_at' | '-created_at' 
export async function getWorkItems(signal: AbortSignal, topSelector: 'All' | WorkItemStatus, searchValue: string, orderingType: WorkItemOrdering, page:number, setPage:(page:number)=>void): Promise<WorkItemsResponse> {
  let url = new URL('/api/v1/workitem/', window.location.origin)
  const params = new URLSearchParams(url.search)
  if (topSelector && topSelector!='All'){
    params.append('status',topSelector)
    setPage(1)
  }
  if (searchValue){
    params.append('search',searchValue)
    setPage(1)
  }
  if (orderingType){
    params.append('ordering',orderingType)
  }
  if (page){
    params.append('page',String(page))  
  }
  url.search=params.toString()

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json() ) as WorkItemsResponse
}

export async function postWorkItems(title: string, description: string) {
  const response = await fetch(
    '/api/v1/workitem/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title, description: description }),
    },
  )
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as WorkItem
}

export async function patchWorkitems(
  id: number,
  status: WorkItemStatus,
): Promise<WorkItem> {
  const response = await fetch(
    `/api/v1/workitem/${id}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  )

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as WorkItem
}

export async function deleteWorkItem(
  id: number,
): Promise<void> {
  const url = `/api/v1/workitem/${id}/`
  const response = await fetch(url, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
}
