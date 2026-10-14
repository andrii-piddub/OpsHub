import { useState, useEffect } from 'react'
import { getHealth } from './api/health'
import type { HealthResponse } from './api/health'
import type { WorkItem } from './api/workitems'
import { getWorkItems } from './api/workitems'



function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [workItems, setWorkItems] = useState<WorkItem[]>([])

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
      setLoading(true)
      setError('')
      setHealth(null)
      try {
        const data = await getWorkItems(controller.signal)
        setWorkItems(data)
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
    checkWorkItem ()
    return () => controller.abort()
  }, [retryCount])

  return (
    <main>
      <h1>OpsHub</h1>
      <button
        type="button"
        onClick={() =>
          setRetryCount((previous) => previous + 1)}
        disabled={loading}
      >
        {loading ? 'Checking' : 'Checking again'}
      </button>

      {loading && <p>Checking connection with server</p>}

      {error && <p role="alert">Error: {error}</p>}

      {health && (
        <div>
          <p>Сервіс: {health.service}</p>
          <p>Статус: {health.status}</p>
        </div>
      )}
    </main>
  )
}

export default App