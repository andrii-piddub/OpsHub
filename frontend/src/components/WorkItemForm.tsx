type WorkItemFormProps = {
  title:string;
  description:string;
 onTitleChange:(value:string)=>void;
}

function WorkItemForm({title, description, onTitleChange}:WorkItemFormProps){
  return (<>
  <h3>
    {title}
  </h3>
  <p>{description}</p>
  </>)
}

export default WorkItemForm