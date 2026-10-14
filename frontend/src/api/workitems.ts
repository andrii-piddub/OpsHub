type WorkItemStatus = 'OP'|'IP'|'DN';
export type WorkItem = {
  id:number;
  title:string;
  description:string;
  status:WorkItemStatus
  created_at:string
}

export async function getWorkItems(signal: AbortSignal): Promise<WorkItem[]>{
  const url = '/api/v1/workitem/'
  const response = await fetch(url, {signal})
  if (!response.ok){
    throw new Error(`Request failed: ${response.status}`)
   }
  return (await response.json()) as WorkItem[]
}