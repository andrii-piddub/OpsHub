import type {WorkItem} from '../api/workitems.ts';
import type {WorkItemStatus} from '../api/workitems.ts'
const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]


type WorkItemsTableProps = {
  workItems:WorkItem[];
  draftStatuses: Record<number, WorkItemStatus>;
  savingItemId:number | null;
  onStatusChange (itemId:number, status:WorkItemStatus):void;
  onSaveStatus(ID:number):void;
}

function WorkItemsTable(props:WorkItemsTableProps) {
  return (null)
}
export default WorkItemsTable