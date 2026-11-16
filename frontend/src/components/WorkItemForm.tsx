import type { WorkItemPriority } from '../api/workitems'
import type {useWorkItem} from '../hooks/useWorkItem'
export type WorkItemFormPar ={
    creationManager:ReturnType<typeof useWorkItem>
}

function WorkItemForm( { creationManager} :WorkItemFormPar) {
  return (<>
    <form
      className="workitem-form"
      onSubmit={creationManager.handleSubmit}>
      <label
        htmlFor="title"
      >Title</label>
      <input
        id="title"
        type="text"
        value={creationManager.title}
        onChange={(event) => {
          creationManager.setTitle(event.target.value)
        }} />
      <label
        htmlFor="description">Description</label>
      <textarea
        id="description"
        value={creationManager.description}
        onChange={(event) => {
          creationManager.setDescription(event.target.value)
        }} />
      <label
        htmlFor="create-priority">Priority</label>
      <select
        aria-label="priority"
        id="create-priority"
        value={creationManager.priority}
        onChange={(event) => {
          creationManager.setPriority(event?.target.value as WorkItemPriority)
        }}>
        {creationManager.priorities.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>
      <label
        htmlFor="create-dueDate">Due Date</label>
      <input
        id="create-dueDate"
        type="date"
        name="due_date"
        value={creationManager.dueDate?.slice(0, 10) ?? ""}
        onChange={(event) => {
          creationManager.setDueDate(event?.target.value || null)
        }}
      />
      <button type="submit" disabled={creationManager.creatingItem}>
        {creationManager.creatingItem ? 'Creating' : 'Submit'}
      </button>
    </form>
    {creationManager.createError && <p role="alert">Error: {creationManager.createError}</p>}


  </>)
}

export default WorkItemForm