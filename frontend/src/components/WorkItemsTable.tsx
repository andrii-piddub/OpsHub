import type { WorkItem } from '../api/workitems.ts';
import type { WorkItemStatus } from '../api/workitems.ts'
import { useState } from 'react';
const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]

type WorkItemsTableProps = {
  workItems: WorkItem[];
  savingItemId: number | null;
  onSaveStatus(ID: number): void;
  onDeleteWorkItem(id: number): void;
  deletingItemId: number | null;
  draft:Draft |null;
}
export type Draft = {
  id:number;
  title:string;
  description:string;
  status:WorkItemStatus;
}


function WorkItemsTable(props: WorkItemsTableProps) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState("")
  return (<>
    <div className="table-wrap">
      <table className="work-table">
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
              <td>{editingItemId === item.id ? <textarea
                className="edit-field"
                rows={3}
                maxLength={500}
                aria-label="Description"
                value={draftTitle}
                onChange={(event) => {
                  setDraftTitle(event.target.value)
                }} /> : item.title}</td>
              <td>{editingItemId === item.id ? <textarea
                className="edit-field"
                rows={3}
                maxLength={500}
                aria-label="Description"
                value={draftDescription}
                onChange={(event) => {
                  setDraftDescription(event.target.value)
                }} /> : item.description}</td>


              <td>
                <span className={`badge badge-${item.status}`}>
                  {statuses.find((s) => s.value === item.status)?.label ?? item.status}
                </span>
              </td>
              <td>
                <select
                  value={props.draft?.id===item.id? props.draft.status: item.status}
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
                <div
                  className="row-actions">
                  <button
                    className="btn btn-save"
                    hidden={editingItemId === item.id}
                    onClick={() => {
                      setEditingItemId(item.id)
                      setDraftTitle(item.title)
                      setDraftDescription(item.description)
                    }}>
                    Edit
                  </button>


                  <button
                    className="btn"
                    hidden={editingItemId !== item.id}
                    onClick={() => { setEditingItemId(null) }}>
                    Save
                  </button>


                  <button
                    className="btn"
                    hidden={editingItemId !== item.id}
                    onClick={() => { setEditingItemId(null) }}>
                    Cancel
                  </button>

                </div>




                {/* <button
                type="button"
                className="btn btn-save"
                // onClick={()=>{setEditing(false)}}
                onClick={() =>{ props.onSaveStatus(item.id)
                }
                }
                disabled={props.savingItemId !== null || props.deletingItemId !== null}
                // hidden = {editing===true}
              >
                {props.savingItemId === item.id ? 'Saving' : 'Save'}
              </button> */}


              </td>
              <td>


                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => props.onDeleteWorkItem(item.id)}
                  disabled={props.deletingItemId !== null || props.savingItemId !== null}
                >
                  {props.deletingItemId === item.id ? 'Deleting' : 'Delete'}


                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>)
}
export default WorkItemsTable
