type WorkItemFormProps = {
  title:string;
  description:string;
}

function WorkItemForm({title, description}:WorkItemFormProps){
  return (<>
  <h3>
    {title}
  </h3>
  <p>{description}</p>
  </>)
}