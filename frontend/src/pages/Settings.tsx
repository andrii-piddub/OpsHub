import { SettingsForm } from '../components/SettingsForm'
import { useSettings } from '../hooks/useSettings'
import { AcumaticaEmployeeDialog } from '../components/AcumaticaEmployeeDialog'
import type { User } from '../api/auth'
import type { Dispatch, SetStateAction } from 'react'
export type SettingsPar = {
    handleErrors: (error: unknown,
        signal?: AbortSignal) => Promise<void>;
    user: User |null,
    setUser:Dispatch<SetStateAction<User | null>>

}
export function Settings({ handleErrors, user, setUser }: SettingsPar) {
    const settingsManager = useSettings(handleErrors)
    return (<>
        <SettingsForm settingsManager={settingsManager} user={user} />
        {settingsManager.displayName &&
            <AcumaticaEmployeeDialog displayName={settingsManager.displayName} employeeId={settingsManager.employeeID}
                closeEmployeeDialog={settingsManager.closeEmployeeDialog} setUser={setUser}/>
        }
    </>)
}
