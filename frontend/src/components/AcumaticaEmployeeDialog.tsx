import { useRef, useEffect } from 'react'
import { employee_acumatica_update } from '../api/auth'
import type { User } from '../api/auth'
import type { Dispatch, SetStateAction } from 'react'
type AcumaticaEmployeeDialogPar = {
    displayName: string,
    employeeId: string,
    closeEmployeeDialog: () => void,
    setUser: Dispatch<SetStateAction<User | null>>

}

export function AcumaticaEmployeeDialog(props: AcumaticaEmployeeDialogPar) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog && !dialog.open) {
            dialog.showModal()
        }
    }, [])
    return (<>



        < dialog ref={dialogRef} className="acumatica-employee-dialog" >
            <p>
                Is it your Name - {props.displayName}?
                <br></br>
                Is it your EmployeeID - {props.employeeId}
            </p>

            <button className="btn btn-save" onClick={async () => {
                await employee_acumatica_update(props.displayName, props.employeeId)
                props.setUser((currentUser) =>
                    currentUser
                        ? {
                            ...currentUser,
                            acumatica_employee_name: props.displayName,
                            acumatica_employee_id: props.employeeId,
                        }
                        : currentUser
                )
                dialogRef.current?.close();
                props.closeEmployeeDialog()
            }
            }>
                Yes
            </button>
            <button className="btn" onClick={() => {
                dialogRef.current?.close();
                props.closeEmployeeDialog()

            }

            }>
                No
            </button>

        </dialog >


    </>)



}
