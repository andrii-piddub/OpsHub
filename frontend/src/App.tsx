import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getHealth } from './api/health'
import type { HealthResponse } from './api/health'
import {useWorkItems} from './hooks/useWorkItems.ts'
import WorkItemsTable from './components/WorkItemsTable.tsx'
import WorkItemForm from './components/WorkItemForm.tsx'





function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const {workItems, setWorkItems, itemsLoading, itemsError, setItemsError,
     creatingItem, setCreatingItem, createError,setCreateError, savingItemId, setSavingItemId, 
     draftStatuses, setDraftStatuses, handleStatusChange, handleSaveStatus, createWorkItem } = useWorkItems(retryCount)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')









  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      setLoading(true)
      setError('')
      setHealth(null)

      try {
        const data = await getHealth(controller.signal)
        setHealth(data)
      } catch (error) {
        if (controller.signal.aborted) return

        setError(
          error instanceof Error
            ? error.message
            : 'Did not receive an answer',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    checkHealth()

    return () => controller.abort()
  }, [retryCount])










// #region handleSubmit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await createWorkItem(title,description)
    
  }



















  return (
    <main>
      <h1>OpsHub</h1>

      <button
        type="button"
        onClick={() => setRetryCount((previous) => previous + 1)}
        disabled={loading || itemsLoading}
      >
        {loading || itemsLoading ? 'Checking' : 'Checking again'}
      </button>







      {loading && <p>Checking connection with server</p>}
      {error && <p role="alert">Error: {error}</p>}

      {health && (
        <div>
          <p>Сервіс: {health.service}</p>
          <p>Статус: {health.status}</p>
        </div>
      )}









      <div>
<WorkItemsTable workItems={workItems} draftStatuses={draftStatuses} savingItemId={savingItemId} onStatusChange={handleStatusChange} onSaveStatus={handleSaveStatus} />









        {itemsLoading && <p>Loading work items</p>}
        {itemsError && <p role="alert">Error: {itemsError}</p>}
      </div>

      {workItems.length === 0 && !itemsLoading && !itemsError && (
        <p>There are no Work Items yet</p>
      )}

      <form onSubmit={handleSubmit}>
       <WorkItemForm 
       title={title}
       description={description} 
       onTitleChange={setTitle}
       onDescriptionChange={setDescription}
       />

        <button type="submit" disabled={creatingItem}>
          {creatingItem ? 'Creating' : 'Submit'}
        </button>
      </form>

      {createError && <p role="alert">Error: {createError}</p>}
    </main>
  )
}

export default App