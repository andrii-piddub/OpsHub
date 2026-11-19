import type { useSupportCasesList } from "../hooks/useSupportCasesList"
import { BUSINESS_TIME_ZONE } from "../utils/businessDate"

const caseDateFormat = new Intl.DateTimeFormat('uk-UA', {
  timeZone: BUSINESS_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatCaseDate(value: string | null) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? <time dateTime={value ?? undefined}>{caseDateFormat.format(date)}</time>
    : '—'
}

export type SupportCasesPar = {
  supportCasesManager: ReturnType<typeof useSupportCasesList>,

}


export function SupportCases(props:SupportCasesPar) {
    const { casses, casesLoading, casesErrors, setRefresh } = props.supportCasesManager
    return (
        <div className="table-wrap support-cases-table-wrap">
            <div className="support-cases-toolbar">
                <button
                    type="button"
                    className="btn btn-save"
                    disabled={casesLoading}
                    onClick={() => setRefresh(previous => previous + 1)}
                >
                    {casesLoading ? 'Syncing…' : 'Sync with Acumatica'}
                </button>
                {casesErrors && <span role="alert">{casesErrors}</span>}
            </div>
            <div className="support-cases-scroll" role="region" aria-label="Support cases table" tabIndex={0}>
            <table className="work-table support-cases-table">
                <thead>
                    <tr>
                        <th scope="col">Case ID</th>
                        <th scope="col">Business Account</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Status</th>
                        <th scope="col">Priority</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Reported On</th>
                        <th scope="col">Reason</th>
                        <th scope="col">Severity</th>
                        <th scope="col">Workgroup</th>
                        <th scope="col">Case Class</th>
                        <th scope="col">Last Incoming Activity</th>
                        <th scope="col">Last Outgoing Activity</th>
                        <th scope="col">Contract</th>
                        <th scope="col">Billable</th>
                        <th scope="col">Active</th>
                        <th scope="col">Description</th>
                        <th scope="col">Contact name</th>
                        <th scope="col">Status Code</th>
                        <th scope="col">Closed at</th>


                    </tr>
                </thead>



        <tbody>
          {casses.map((item) => {


            return (
              <tr key={item.case_id}>
                <td>{item.case_id}</td>
                <td>{item.business_account}</td>
                <td>{item.subject}</td>
                <td>{item.status}</td>
                <td>{item.priority}</td>
                <td>{item.owner_employee_name}</td>
                <td className="created-cell">{formatCaseDate(item.reported_on)}</td>
                <td>{item.reason}</td>
                <td>{item.severity}</td>
                <td>{item.workgroup}</td>
                <td>{item.case_class}</td>
                <td className="created-cell">{formatCaseDate(item.last_incoming_activity)}</td>
                <td className="created-cell">{formatCaseDate(item.last_outgoing_activity)}</td>
                <td>{item.contract}</td>
                <td>{item.billable === null ? '—' : item.billable ? 'Yes' : 'No'}</td>
                <td>{item.active === null ? '—' : item.active ? 'Yes' : 'No'}</td>
                <td>{item.description}</td>
                <td>{item.contact_name}</td>
                <td>{item.status_code}</td>
                <td className="created-cell">{formatCaseDate(item.closed_at)}</td>

              </tr>
            )
          })}
        </tbody>
            </table>
            </div>
        </div>
    )

}


export default SupportCases
