type WorkItemFormProps = {
  title:string;
  description:string;
 onTitleChange:(value:string)=>void;
}

function WorkItemForm({title, description, onTitleChange}:WorkItemFormProps){
  return (<>
  <input
  type="text"
  value={title} 
  onChange={(event)=>{
    value=event.target.value
    onTitleChange(value)
  }}/>
  <p>{description}</p>
  </>)
}

export default WorkItemForm