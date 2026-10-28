type WorkItemFormProps = {
  title:string;
  description:string;
 onTitleChange:(value:string)=>void;
 onDescriptionChange:(value:string)=>void;
}

function WorkItemForm({title, description, onTitleChange, onDescriptionChange}:WorkItemFormProps){
  return (<>
  <label
  htmlFor="title"
  >Title</label>
  <input
  id="title"
  type="text"
  value={title} 
  onChange={(event)=>{
   onTitleChange(event.target.value)
  }}/>
  <label
  htmlFor="description">Description</label>
  <textarea
  id="description"
  value={description} 
  onChange={(event)=>{
    onDescriptionChange(event.target.value)
  }}/>
  </>)
}

export default WorkItemForm