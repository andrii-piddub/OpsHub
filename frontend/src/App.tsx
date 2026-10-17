import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getHealth } from './api/health'
import type { HealthResponse } from './api/health'
import type { WorkItem, WorkItemStatus } from './api/workitems'
import {
  getWorkItems,
  postWorkItems,
  patchWorkitems,
} from './api/workitems'

const statuses: { value: WorkItemStatus; label: string }[] = [
  { value: 'OP', label: 'Open' },
  { value: 'IP', label: 'In Progress' },
  { value: 'DN', label: 'Done' },
]






function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [createError, setCreateError] = useState('')
  const [creatingItem, setCreatingItem] = useState(false)
  const [draftStatuses, setDraftStatuses] = useState<
    Record<number, WorkItemStatus>
  >({})
  const [savingItemId, setSavingItemId] = useState<number | null>(null)

  const handleStatusChange = (itemId: number, status: WorkItemStatus) => {
    setDraftStatuses((previous) => ({
      ...previous,
      [itemId]: status,
    }))
  }








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







  useEffect(() => {
    const controller = new AbortController()

    async function checkWorkItem() {
      setItemsLoading(true)
      setItemsError('')
      setWorkItems([])

      try {
        const data = await getWorkItems(controller.signal)
        setWorkItems(data)
      } catch (error) {
        if (controller.signal.aborted) return

        setItemsError(
          error instanceof Error
            ? error.message
            : 'Did not receive an answer',
        )
      } finally {
        if (!controller.signal.aborted) {
          setItemsLoading(false)
        }
      }
    }

    checkWorkItem()

    return () => controller.abort()
  }, [retryCount])






// #region handleSubmit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreatingItem(true)
    setCreateError('')

    try {
      const newItem = await postWorkItems(title, description)
      setWorkItems((previousItems) => [...previousItems, newItem])
      setTitle('')
      setDescription('')
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Failed to create WorkItem',
      )
    } finally {
      setCreatingItem(false)
    }
  }









  async function handleSaveStatus(itemId: number) {
    const selectedStatus = draftStatuses[itemId]

    if (!selectedStatus) return

    setItemsError('')
    setSavingItemId(itemId);

    try {
      const updatedItem = await patchWorkitems(itemId, selectedStatus)

      setWorkItems((previousItems) =>
        previousItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      )

      setDraftStatuses((previous) => {
        const remaining = { ...previous }

        delete remaining[itemId]
        return remaining
      })
    } catch (error) {
      setItemsError(
        error instanceof Error ? error.message : 'Failed to update status',
      )
    }
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
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Current status</th>
              <th scope="col">Change status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody>
            {workItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.status}</td>
                <td>
                  <select
                    value={draftStatuses[item.id] ?? item.status}
                    onChange={(event) =>
                      handleStatusChange(
                        item.id,
                        event.target.value as WorkItemStatus,
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleSaveStatus(item.id)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>









        {itemsLoading && <p>Loading work items</p>}
        {itemsError && <p role="alert">Error: {itemsError}</p>}
      </div>

      {workItems.length === 0 && !itemsLoading && !itemsError && (
        <p>There are no Work Items yet</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <p>TITLE</p>
          <input
            type="text"
            placeholder="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <p>DESCRIPTION</p>
          <input
            type="text"
            placeholder="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <button type="submit" disabled={creatingItem}>
          {creatingItem ? 'Creating' : 'Submit'}
        </button>
      </form>

      {createError && <p role="alert">Error: {createError}</p>}
    </main>
  )
}

export default App