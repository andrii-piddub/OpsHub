import type { WorkItem } from '../api/workitems.ts';
import type { WorkItemStatus } from '../api/workitems.ts'
const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]

type WorkItemsTableProps = {
  workItems: WorkItem[];
  savingItemId: number | null;
  onSaveAction(id: number): void;
  onDeleteWorkItem(id: number): void;
  deletingItemId: number | null;
  editingItemId: number | null;
  setEditingItemId: (id: number | null) => void;
  draftTitle: string;
  setDraftTitle: (value: string) => void;
  draftDescription: string;
  setDraftDescription: (value: string) => void;
  draftStatus: WorkItemStatus;
  setDraftStatus: (value: WorkItemStatus) => void;
}



function WorkItemsTable(props: WorkItemsTableProps) {

  console.log(props.editingItemId)
  console.log(props.draftTitle)
  console.log(props.draftDescription)
  console.log(props.draftStatus)
  return (<>
    <div className="table-wrap">
      <table className="work-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Current status</th>
            <th scope="col">Action</th>
            <th scope="col">Delete</th>

          </tr>
        </thead>

        <tbody>
          {props.workItems.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>

              <td>{props.editingItemId === item.id ? <textarea
                className="edit-field"
                rows={3}
                maxLength={200}
                aria-label="Title"
                value={props.draftTitle}
                disabled={props.savingItemId === item.id || props.deletingItemId !== null}
                onChange={(event) => {
                  props.setDraftTitle(event.target.value)
                }} /> : item.title}
              </td>

              <td>{props.editingItemId === item.id ? <textarea
                className="edit-field"
                rows={3}
                maxLength={200}
                aria-label="Description"
                disabled={props.savingItemId === item.id || props.deletingItemId !== null}
                value={props.draftDescription}
                onChange={(event) => {
                  props.setDraftDescription(event.target.value)
                }} /> : item.description}</td>

              <td>{props.editingItemId === item.id ? <select
                value={props.draftStatus}
                disabled={props.savingItemId === item.id || props.deletingItemId !== null}
                onChange={(event) =>
                  props.setDraftStatus(event.target.value as WorkItemStatus)
                }

              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select> : <span className={`badge badge-${item.status}`}>
                {statuses.find((s) => s.value === item.status)?.label ?? item.status}
              </span>}
              </td>

              <td>
                <div
                  className="row-actions">
                  <button
                    className="btn btn-save"
                    hidden={props.editingItemId === item.id}
                    onClick={() => {
                      props.setEditingItemId(item.id)
                      props.setDraftTitle(item.title)
                      props.setDraftDescription(item.description)
                      props.setDraftStatus(item.status)
                    }}>
                    Edit
                  </button>


                  <button
                    className="btn"
                    hidden={props.editingItemId !== item.id}
                    onClick={() => { props.onSaveAction(item.id) }}
                    disabled={props.savingItemId !== null || props.deletingItemId !== null}>
                    {props.savingItemId === item.id ? 'Saving' : 'Save'}
                  </button>


                  <button
                    className="btn"
                    hidden={props.editingItemId !== item.id}
                    disabled={props.savingItemId === item.id || props.deletingItemId !== null}
                    onClick={() => { props.setEditingItemId(null) }}>
                    Cancel
                  </button>

                </div>




                {/* <button
                type="button"
                className="btn btn-save"
                // onClick={()=>{setEditing(false)}}
                onClick={() =>{ props.onSaveAction(item.id)
                }
                }
                
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
