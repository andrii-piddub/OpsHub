import type {WorkItem} from '../src/api/workitems.ts';
import type {WorkItemStatus} from '../src/api/workitems.ts'



type WorkItemsTableProps = {
  WorkItem:WorkItem;
  draftStatuses: Record<number, WorkitemStatus>;
  savingItemId:<number | null>;
  function onStatusChange (ID){
    return
  }
  async onSaveStatus(ID){

  }
}
