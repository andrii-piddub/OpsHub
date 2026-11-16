import WorkItemForm from "../components/WorkItemForm";
import type {WorkItemFormPar} from '../components/WorkItemForm'
import { useWorkItem } from "../hooks/useWorkItem";

export function CreateWorkitem({handleErrors}:WorkItemFormPar){
    const creationManager = useWorkItem(handleErrors)
    return(<>
    <WorkItemForm handleErrors={handleErrors} creationManager={creationManager}/>
    </>)
}