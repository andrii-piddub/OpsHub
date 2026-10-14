import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getHealth } from './api/health'
import type { HealthResponse } from './api/health'
import type { WorkItem } from './api/workitems'
import { getWorkItems, postWorkItems } from './api/workitems'




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
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const controller = new AbortController()
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
          : 'Failed to create WorkItem'
      )
    } finally {
      if (!controller.signal.aborted) {
        setItemsLoading(false)
      }
    }
  }
      return (
        <main>
          <h1>OpsHub</h1>
          <button
            type="button"
            onClick={() =>
              setRetryCount((previous) => previous + 1)}
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
            {workItems.map((item) => {
              return (
                <p key={item.id}>
                  {item.id} {item.title},{item.description}, {item.status}
                </p>
              )
            })}
            {itemsLoading && <p>Loading work items</p>}

            {itemsError && <p role="alert">Error: {itemsError}</p>}
          </div>
          <div>
            {workItems.length === 0 && !itemsLoading && !itemsError && ('There are no Work Items yet')}
          </div>
          <form onSubmit={handleSubmit}>
            <div>
              <p>TITLE</p>
              <input
                type='text'
                placeholder='title'
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
              />
            </div>
            <div>
              <p>DESCRIPTION</p>
              <input
                type='text'
                placeholder='description'
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                }}
              />

            </div>
            <button type='submit'>Submit</button>
          </form>
          <div>
            {createError && <p role="alert">Error: {createError}</p>}
          </div>
        </main>
      )
    }

    export default App
