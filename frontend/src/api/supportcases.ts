import {ApiErrors} from './ApiError'
export type SupportCases={
    case_id:string,
    business_account: string,
    subject:string,
    status:string,
    reason:string,
    severity:string,
    priority:string,
    owner_employee_name:string,
    workgroup:string,
    case_class:string,
    reported_on: string | null,
    last_incoming_activity: string | null,
    last_outgoing_activity: string | null,
    contract:string,
    billable: boolean | null,
    active: boolean | null,
    description:string,
    contact_name:string,
    status_code:string,
    closed_at: string | null

}

type SupportCasesResponse = {
  cases: SupportCases[]
}
export type WorkItemOrdering = 'created_at' | '-created_at'
export async function getSupportCases(signal: AbortSignal): Promise<SupportCasesResponse> {
  const url = new URL('/api/v1/acumatica/cases/', window.location.origin)
//   const params = new URLSearchParams(url.search)
 
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`,response.status )
  }
  return (await response.json()) as SupportCasesResponse
}
