import type {WorkItem} from '../api/workitems.ts';
import type {WorkItemStatus} from '../api/workitems.ts'



type WorkItemsTableProps = {
  workItems:WorkItem;
  draftStatuses: Record<number, WorkitemStatus>;
  savingItemId:<number | null>;
  function onStatusChange (ID){
    return
  }
  async onSaveStatus(ID){

  }
}
