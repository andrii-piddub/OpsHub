import type { WorkItem } from '../api/workitems.ts'
import type { WorkItemStatus, WorkItemPriority } from '../api/workitems.ts'

const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]

const priorities: { value: WorkItemPriority; label: string }[] = [
  { value: 'LO', label: 'Low' },
  { value: 'ME', label: 'Medium' },
  { value: 'HI', label: 'High' },
]

type WorkItemsTableProps = {
  workItems: WorkItem[]
  savingItemId: number | null
  onSaveAction(id: number): void
  onDeleteWorkItem(id: number): void
  deletingItemId: number | null
  editingItemId: number | null
  setEditingItemId: (id: number | null) => void
  draftTitle: string
  setDraftTitle: (value: string) => void
  draftDescription: string
  setDraftDescription: (value: string) => void
  draftStatus: WorkItemStatus
  setDraftStatus: (value: WorkItemStatus) => void
  draftPriority: WorkItemPriority
  setDraftPriority: (value: WorkItemPriority) => void
}

function WorkItemsTable(props: WorkItemsTableProps) {
  return (
    <div className="table-wrap">
      <table className="work-table">
        <colgroup>
          <col style={{ width: '56px' }} /> {/* ID */}
          <col style={{ width: '20%' }} /> {/* Title */}
          <col style={{ width: '28%' }} /> {/* Description */}
          <col style={{ width: '110px' }} /> {/* Priority */}
          <col style={{ width: '130px' }} /> {/* Status */}
          <col style={{ width: '170px' }} /> {/* Action */}
          <col style={{ width: '100px' }} /> {/* Delete */}
        </colgroup>

        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Priority</th>
            <th scope="col">Current status</th>
            <th scope="col">Action</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>

        <tbody>
          {props.workItems.map((item) => {
            const isEditing = props.editingItemId === item.id
            const isSaving = props.savingItemId === item.id
            const isBusy = props.savingItemId !== null || props.deletingItemId !== null
            const fieldsDisabled = isSaving || props.deletingItemId !== null

            return (
              <tr key={item.id}>
                <td>{item.id}</td>

                <td>
                  {isEditing ? (
                    <textarea
                      className="edit-field"
                      rows={3}
                      maxLength={200}
                      aria-label="Title"
                      value={props.draftTitle}
                      disabled={fieldsDisabled}
                      onChange={(event) => props.setDraftTitle(event.target.value)}
                    />
                  ) : (
                    item.title
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <textarea
                      className="edit-field"
                      rows={3}
                      maxLength={200}
                      aria-label="Description"
                      value={props.draftDescription}
                      disabled={fieldsDisabled}
                      onChange={(event) => props.setDraftDescription(event.target.value)}
                    />
                  ) : (
                    item.description
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      aria-label="Priority"
                      value={props.draftPriority}
                      disabled={fieldsDisabled}
                      onChange={(event) =>
                        props.setDraftPriority(event.target.value as WorkItemPriority)
                      }
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge badge-priority-${item.priority}`}>
                      {priorities.find((p) => p.value === item.priority)?.label ??
                        item.priority}
                    </span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      aria-label="Status"
                      value={props.draftStatus}
                      disabled={fieldsDisabled}
                      onChange={(event) =>
                        props.setDraftStatus(event.target.value as WorkItemStatus)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge badge-${item.status}`}>
                      {statuses.find((s) => s.value === item.status)?.label ?? item.status}
                    </span>
                  )}
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-save"
                      hidden={isEditing}
                      onClick={() => {
                        props.setEditingItemId(item.id)
                        props.setDraftTitle(item.title)
                        props.setDraftDescription(item.description)
                        props.setDraftStatus(item.status)
                        props.setDraftPriority(item.priority)
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn"
                      hidden={!isEditing}
                      disabled={isBusy}
                      onClick={() => props.onSaveAction(item.id)}
                    >
                      {isSaving ? 'Saving' : 'Save'}
                    </button>

                    <button
                      type="button"
                      className="btn"
                      hidden={!isEditing}
                      disabled={fieldsDisabled}
                      onClick={() => props.setEditingItemId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>

                <td>
                  <button
                    type="button"
                    className="btn btn-delete"
                    onClick={() => props.onDeleteWorkItem(item.id)}
                    disabled={isBusy}
                  >
                    {props.deletingItemId === item.id ? 'Deleting' : 'Delete'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default WorkItemsTable
