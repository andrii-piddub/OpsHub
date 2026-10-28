import type { WorkItem } from '../api/workitems.ts';
import type { WorkItemStatus } from '../api/workitems.ts'
const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]


type WorkItemsTableProps = {
  workItems: WorkItem[];
  draftStatuses: Record<number, WorkItemStatus>;
  savingItemId: number | null;
  onStatusChange(itemId: number, status: WorkItemStatus): void;
  onSaveStatus(ID: number): void;
  onDeleteWorkItem(id: number): void;
  deletingItemId: number | null;
}






function WorkItemsTable(props: WorkItemsTableProps) {
  return (<>
    <table>
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Title</th>
          <th scope="col">Description</th>
          <th scope="col">Current status</th>
          <th scope="col">Change status</th>
          <th scope="col">Action</th>
          <th scope="col">Delete</th>

        </tr>
      </thead>

      <tbody>
        {props.workItems.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.title}</td>
            <td>{item.description}</td>
            <td>{item.status}</td>
            <td>
              <select
                value={props.draftStatuses[item.id] ?? item.status}
                onChange={(event) =>
                  props.onStatusChange(
                    item.id,
                    event.target.value as WorkItemStatus,
                  )
                }
                disabled={props.savingItemId === item.id || props.deletingItemId !== null}
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <button
                type="button"
                onClick={() => props.onSaveStatus(item.id)}
                disabled={props.savingItemId !== null || props.deletingItemId !== null}
              >
                {props.savingItemId === item.id ? 'Saving' : 'Save'}
              </button>
            </td>
            <td>
              <button
                type="button"
                onClick={() => props.onDeleteWorkItem(item.id)}
                disabled={props.deletingItemId !== null || props.savingItemId !== null}
              >
                {props.deletingItemId === item.id? 'Deleting' : 'Delete'}

              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>)
}
export default WorkItemsTable