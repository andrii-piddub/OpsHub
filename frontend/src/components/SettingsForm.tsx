import type { useSettings } from '../hooks/useSettings'
import type { User } from '../api/auth'

type SettingsFormProps = {
  settingsManager: ReturnType<typeof useSettings>,
  user:User |null
}

export function SettingsForm({ settingsManager, user }: SettingsFormProps) {

  return (<>
    <form
      className="workitem-form"
      onSubmit={(e) => {
        e.preventDefault()
        void settingsManager.getEmployee()
      }
      }>
      <label
        htmlFor="title"
      >Acumatica Employee ID</label>
      <input
        id="title"
        type="text"
        value={settingsManager.acumaticaEmployeeID}
        onChange={(e) => {
          settingsManager.setAcumaticaEmployeeID(e.target.value)
        }}
      />
      {user?.acumatica_employee_name  && (<p>Your Acumatica Display Name{user.acumatica_employee_name}</p>)}
      {user?.acumatica_employee_id  && (<p>Your Acumatica Employee ID {user.acumatica_employee_id}</p>)}

      <button
        type="submit"
        disabled={settingsManager.requesting}
      >
        Find Employee in Acumatica
      </button>
        {settingsManager.error && (
          <p role="alert">{settingsManager.error}</p>
        )}

      <button
        type="button"
        disabled={settingsManager.errorCode !== 'acumatica_auth_required'}
        onClick={settingsManager.acumaticaConnect}
      >
        Connect to Acumatica
      </button>
    </form>


      
  </>)
}
