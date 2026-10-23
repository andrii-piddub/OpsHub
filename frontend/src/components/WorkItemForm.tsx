type WorkItemFormProps = {
  title:string;
  description:string;
 onTitleChange:(value:string)=>void;
 onDescriptionChange(value:string)=>void;
}

function WorkItemForm({title, description, onTitleChange, onDescriptionChange}:WorkItemFormProps){
  return (<>
  <input
  type="text"
  value={title} 
  onChange={(event)=>{
    onTitleChange(event.target.value)
  }}/>
  <textarea
  value={description} />
  </>)
}

export default WorkItemForm