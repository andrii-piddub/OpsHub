
// import { SupportCase } from '../components/SettingsForm'
// import { useSettings } from '../hooks/useSettings'
// import { AcumaticaEmployeeDialog } from '../components/AcumaticaEmployeeDialog'
// import type { User } from '../api/auth'

import SupportCases from "../components/SupportCases";
import { useSupportCasesList } from "../hooks/useSupportCasesList";

// import type { Dispatch, SetStateAction } from 'react'
export type SupportCasesPar = {
    handleErrors: (error: unknown,
        signal?: AbortSignal) => Promise<void>;
    // user: User |null,
    // setUser:Dispatch<SetStateAction<User | null>>

}
export function SupportCasePage({handleErrors}: SupportCasesPar) {
    const supportCasesManager = useSupportCasesList({handleErrors})
    return (<>
        <SupportCases supportCasesManager={supportCasesManager}/>

        
    </>)
}
