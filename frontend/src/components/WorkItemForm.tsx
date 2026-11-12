import type { WorkItemPriority } from '../api/workitems'
type WorkItemFormProps = {
  title: string;
  description: string;
  priority: WorkItemPriority;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: WorkItemPriority) => void;
  priorities:{value: WorkItemPriority; label: string}[];
  dueDate:string | null;
  onDueDateChange:(value:string | null)=>void;

}



function WorkItemForm({ title, description, priority, onTitleChange, onDescriptionChange, onPriorityChange, priorities, dueDate, onDueDateChange }: WorkItemFormProps) {
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
      htmlFor="create-priority">Priority</label>
    <select
      aria-label="priority"
      id="create-priority"
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
       <label
      htmlFor="create-dueDate">Due Date</label>
      <input 
        id="create-dueDate"
        type="date" 
        name="due_date"
        value={dueDate?.slice(0,10)??""}
        onChange={(event)=>{
          onDueDateChange(event?.target.value || null)
        }}
                   />
  </>)
}

export default WorkItemForm