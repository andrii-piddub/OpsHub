import WorkItemForm from "../components/WorkItemForm";
import type {WorkItemFormPar} from '../components/WorkItemForm'
import { useWorkItem } from "../hooks/useWorkItem";
export type CreationWorkItemPar={
   handleErrors:(error: unknown,
    signal?: AbortSignal) => Promise<void>
}
export function CreateWorkitem({handleErrors}:CreationWorkItemPar){
    const creationManager = useWorkItem(handleErrors)
    return(<>
    <WorkItemForm creationManager={creationManager}/>
    </>)
}