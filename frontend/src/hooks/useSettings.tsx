import { useState } from "react"
import { getAcumaticaEmployee, acumaticaConnect } from '../api/acumaticaEmployee'
import type { AcumaticaEmployee } from '../api/acumaticaEmployee'
import { ApiErrors } from "../api/ApiError"

export function useSettings(handleErrors: (error: unknown,
    signal?: AbortSignal) => Promise<void>) {
    const [acumaticaEmployeeID, setAcumaticaEmployeeID] = useState("")
    const [error, setError] = useState('')
    const [errorCode, setErrorCode] = useState('')
    const [displayName, setDisplayName]= useState('')
    const [employeeID, setEmployeeID]=useState('')
    const closeEmployeeDialog = ()=>{setDisplayName('')}
    async function getEmployee(employee: AcumaticaEmployee = { acumaticaEmployeeID }) {
        setError('')
        try {
            // acumaticaConnect()
            const data = await getAcumaticaEmployee(employee)
            setDisplayName( data.employees[0]?.DisplayName?.value)
            setEmployeeID (data.employees[0]?.EmployeeID?.value)

        } catch (error) {
            await handleErrors(error)
            setError(
                // error instanceof ApiErrors ? `${error.message}${error.code ? ` (${error.code})` : ''}`: 'Failed to get Acumatica employee',
                error instanceof ApiErrors ? error.message : 'Failed to get Acumatica employee')
            setErrorCode(
                error instanceof ApiErrors ? error.code ?? '' : '',
            )


        }
    }
    return { acumaticaEmployeeID, setAcumaticaEmployeeID, error, getEmployee, errorCode, acumaticaConnect, 
        displayName, employeeID, closeEmployeeDialog}
}
