import { useState } from "react"
import { getAcumaticaEmployee, acumaticaConnect } from '../api/acumaticaEmployee'
import type { AcumaticaEmployee } from '../api/acumaticaEmployee'
import { ApiErrors } from "../api/ApiError"

export function useSettings(handleErrors: (error: unknown,
    signal?: AbortSignal) => Promise<void>) {
    const [acumaticaEmployeeID, setAcumaticaEmployeeID] = useState("")
    const [error, setError] = useState('')
    const [errorCode, setErrorCode] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [employeeID, setEmployeeID] = useState('')
    const closeEmployeeDialog = () => { setDisplayName('') }
    const [requesting,setRequesting]=useState(false)
    async function getEmployee(employee: AcumaticaEmployee = { acumaticaEmployeeID }) {
        setError('')
        setDisplayName('')
        setEmployeeID('')
        try {
            // acumaticaConnect()
            setRequesting(true)
            const data = await getAcumaticaEmployee(employee)
            const employees = data.employees
            const found = employees[0]
            if (found.EmployeeID?.value !== employee.acumaticaEmployeeID) {
                setError('Acumatica returned a different Employee ID')
                return
            }
            if (employees.length === 0) {
                setError('Employee not found')
                return

            } else if (employees.length != 1) {
                setError('There are multiple employees')
                return
            } else if (!employees?.length) {
                setError('Employee not found')
                return
            }

            setDisplayName(data.employees[0]?.DisplayName?.value)
            setEmployeeID(data.employees[0]?.EmployeeID?.value)

        } catch (error) {
            await handleErrors(error)
            setError(
                // error instanceof ApiErrors ? `${error.message}${error.code ? ` (${error.code})` : ''}`: 'Failed to get Acumatica employee',
                error instanceof ApiErrors ? error.message : 'Failed to get Acumatica employee')
            setErrorCode(
                error instanceof ApiErrors ? error.code ?? '' : '',
            )


        }finally{
            setRequesting(false)
        }
    }
    return {
        acumaticaEmployeeID, setAcumaticaEmployeeID, error, getEmployee, errorCode, acumaticaConnect,
        displayName, employeeID, closeEmployeeDialog, requesting
    }
}
