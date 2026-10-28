export type WorkItemStatus = 'OP' | 'IP' | 'DN'
export type WorkItem = {
  id: number;
  title: string;
  description: string;
  status: WorkItemStatus
  created_at: string
}

export async function getWorkItems(signal: AbortSignal): Promise<WorkItem[]> {
  const url = '/api/v1/workitem/'
  const response = await fetch(url, { signal })
 if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  } 
  return (await response.json()) as WorkItem[]
}

export async function postWorkItems(title:string, description:string) {
  const response = await fetch(
    '/api/v1/workitem/',   
    {
      method: 'POST',                           
      headers: {
        'Content-Type': 'application/json',      
      },
      body: JSON.stringify({ title: title, description: description}),  
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
  const response = await fetch(url,{method:'DELETE'} )
}
