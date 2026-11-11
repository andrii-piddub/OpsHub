import type { WorkItemPriority } from '../api/workitems'
type WorkItemFormProps = {
  title: string;
  description: string;
  priority: WorkItemPriority;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: WorkItemPriority) => void;
  priorities:{value: WorkItemPriority; label: string}[]

}



function WorkItemForm({ title, description, priority, onTitleChange, onDescriptionChange, onPriorityChange, priorities }: WorkItemFormProps) {
  return (<>
    <label
      htmlFor="title"
    >Title</label>
    <input
      id="title"
      type="text"
      value={title}
      onChange={(event) => {
        onTitleChange(event.target.value)
      }} />
    <label
      htmlFor="description">Description</label>
    <textarea
      id="description"
      value={description}
      onChange={(event) => {
        onDescriptionChange(event.target.value)
      }} />
    <label
      htmlFor="priority">Description</label>
    <select
      aria-label="Priority"
      value={priority}
      onChange={(event) => {
        onPriorityChange(event?.target.value as WorkItemPriority)
      }}>
      {priorities.map((priority) => (
        <option key={priority.value} value={priority.value}>
          {priority.label}
        </option>
      ))}
    </select>
  </>)
}

export default WorkItemForm