import WorkItemForm from "../components/WorkItemForm";
import type {WorkItemFormPar} from '../components/WorkItemForm'

export function CreateWorkitem({handleErrors}:WorkItemFormPar){
    return(<>
    <WorkItemForm handleErrors={handleErrors}/>
    </>)
}