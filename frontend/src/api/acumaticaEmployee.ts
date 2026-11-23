export type User = { id: number, username: string }
import { ApiErrors } from './ApiError'

export type AcumaticaEmployee = {
    acumaticaEmployeeID: string
}


export function acumaticaConnect(source:string): void {
    window.location.assign(
        `http://localhost:8000/api/v1/acumatica/connect/?return_to=${encodeURIComponent(source)}`
    )   
}


export async function getAcumaticaEmployee({ acumaticaEmployeeID }: AcumaticaEmployee) {
    const url = new URL('/api/v1/acumatica/employee/', window.location.origin)
    const params = new URLSearchParams({ employee_id: acumaticaEmployeeID })
    url.search = params.toString()
    const response = await fetch(url, { credentials: "include" })
    if (!response.ok) {
        const data = await response.json()  
        throw new ApiErrors(data.error ?? `Request failed: ${response.status}`, response.status, data.code)
    }
    return (await response.json())
}
