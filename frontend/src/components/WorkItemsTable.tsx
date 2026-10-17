import type {WorkItem} from '../api/workitems.ts';
import type {WorkItemStatus} from '../api/workitems.ts'



type WorkItemsTableProps = {
  workItems:WorkItem[];
  draftStatuses: Record<number, WorkItemStatus>;
  savingItemId:number | null;
  onStatusChange (ID)=>return;
  
  async onSaveStatus(ID){

  }
}
