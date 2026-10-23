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
    onTitleChange(event.target.value)
  }}/>
  <p>{description}</p>
  </>)
}

export default WorkItemForm