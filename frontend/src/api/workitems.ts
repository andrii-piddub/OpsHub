type WorkItemStatus = 'OP'|'IP'|'DN';
type WorkItem = {
  id:number;
  title:string;
  description:string;
  status:WorkItemStatus
  created_at:string
}

async function getWorkItems(){
  const url = 'http://127.0.0.1:8000/api/v1/workitem/'
  const response = await fetch(url)
  if (!response.ok){
    throw new Error(`Request failed: ${response.status}`)
   }
  return (await response.json()) as WorkItem[]
}