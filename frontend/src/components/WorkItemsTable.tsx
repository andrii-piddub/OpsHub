import type {WorkItem} from '../api/workitems.ts';
import type {WorkItemStatus} from '../api/workitems.ts'



type WorkItemsTableProps = {
  workItems:WorkItem[];
  draftStatuses: Record<number, WorkItemStatus>;
  savingItemId:number | null;
  onStatusChange (itemId:number, status:WorkItemStatus):void;
  onSaveStatus(ID:number):void;
}
