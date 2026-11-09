import type { WorkItemStatus, WorkItemPriority } from '../api/workitems'
import type { WorkItem } from '../api/workitems';
import { useState } from 'react';

export type DraftWorkItem = {
    draftId: number | null;
    draftTitle: string;
    draftDescription: string;
    draftStatus: WorkItemStatus;
    draftPriority: WorkItemPriority;

}

export function useWorkItemDraft(){
    
    const [draft, setDraft] = useState<DraftWorkItem>({
        draftId: null,
        draftTitle: '',
        draftDescription: '',
        draftStatus: 'OP',
        draftPriority: 'ME'
    })
    
    function startEditing(item: WorkItem) {
    
        setDraft((pr) => ({
            ...pr,
            draftId: item.id,
            draftTitle: item.title,
            draftDescription: item.description,
            draftStatus: item.status,
            draftPriority: item.priority
        }));
    
    }
    
    function cancelEditing(){
       setDraft((pr)=>({...pr, draftId:null})) 
    }
    
    function updateDraft(changes:Partial<DraftWorkItem>){
        setDraft((pr)=>({
            ...pr,
            ...changes,
            }));  
        }

        return {
            draft, setDraft, startEditing, cancelEditing, updateDraft
        }

}    
