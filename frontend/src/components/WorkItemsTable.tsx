import type { WorkItem } from '../api/workitems.ts'
import type { WorkItemStatus, WorkItemPriority } from '../api/workitems.ts'
import type { DraftWorkItem } from '../hooks/useWorkItemDraft.ts'
import type { useWorkItemsList } from '../hooks/useWorkItemsList.ts'

const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]



type WorkItemsTableProps = {
  savingItemId: number | null
  onSaveAction(id: number): void
  onDeleteWorkItem(id: number): void
  deletingItemId: number | null
  startEditing: (item: WorkItem) => void
  draft: DraftWorkItem
  cancelEditing: () => void
  updateDraft: (changes: Partial<Omit<DraftWorkItem, 'draftId'>>) => void
  workItemListManager: ReturnType<typeof useWorkItemsList>
  priorities: { value: WorkItemPriority; label: string }[]
}

function WorkItemsTable(props: WorkItemsTableProps) {
  return (
    <div className="table-wrap">
      <table className="work-table">
        <colgroup>
          <col style={{ width: '56px' }} /> {/* ID */}
          <col style={{ width: '16%' }} /> {/* Title */}
          <col /> {/* Description: remaining space */}
          <col style={{ width: '100px' }} /> {/* Priority */}
          <col style={{ width: '140px' }} /> {/* Status */}
          <col style={{ width: '164px' }} /> {/* Action */}
          <col style={{ width: '92px' }} /> {/* Delete */}
          <col style={{ width: '150px' }} /> {/* Created */}
          <col style={{ width: '164px' }} /> {/* Deadline */}
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
            <th scope="col">Created</th>
            <th scope="col">Deadline</th>
          </tr>
        </thead>

        <tbody>
          {props.workItemListManager.workItems.map((item) => {
            const isEditing = props.draft.draftId === item.id
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
                      value={props.draft.draftTitle}
                      disabled={fieldsDisabled}
                      onChange={(event) => {
                        props.updateDraft({ draftTitle: event?.target.value })
                      }}
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
                      value={props.draft.draftDescription}
                      disabled={fieldsDisabled}
                      onChange={(event) => {
                        props.updateDraft({ draftDescription: event?.target.value })
                      }}
                    />
                  ) : (
                    item.description
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      aria-label="Priority"
                      value={props.draft.draftPriority}
                      disabled={fieldsDisabled}
                      onChange={(event) => {
                        props.updateDraft({ draftPriority: event?.target.value as WorkItemPriority })
                      }}
                    >
                      {props.priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge badge-priority-${item.priority}`}>
                      {props.priorities.find((p) => p.value === item.priority)?.label ??
                        item.priority}
                    </span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      aria-label="Status"
                      value={props.draft.draftStatus}
                      disabled={fieldsDisabled}
                      onChange={(event) => {
                        props.updateDraft({ draftStatus: event?.target.value as WorkItemStatus })
                      }}
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
                      disabled={props.draft.draftId !== null || isBusy}
                      onClick={() => {
                        props.startEditing(item)

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
                      onClick={props.cancelEditing}

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
                <td className="created-cell">
                  <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </td>
                <td className="created-cell">
                  {isEditing ? (
                    <input 
                    type="date" 
                    name="due_date" 
                    value={props.draft.draftDueDate?.slice(0,10)??""}
                    onChange={(event) => {
                        props.updateDraft({ draftDueDate: event?.target.value })
                    }}
                    />
                  ) : item.due_date !== null ? (
                    <time dateTime={item.due_date}>
                      {new Date(item.due_date).toLocaleDateString('uk-UA')}
                    </time>
                  ) : (
                    '-'
                  )}
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
