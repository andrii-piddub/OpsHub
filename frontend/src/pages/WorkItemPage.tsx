import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getHealth } from '../api/health'
import type { HealthResponse } from '../api/health'
import { useWorkItems } from '../hooks/useWorkItems.ts'
import WorkItemsTable from '../components/WorkItemsTable.tsx'
import WorkItemForm from '../components/WorkItemForm.tsx'
import type { WorkItemStatus, WorkItemOrdering } from '../api/workitems'
import type { User } from '../api/auth'
import { logout } from '../api/auth'

export type WorkItemPageProps={
  user:User | null;
  getUser:(user:User | null)=>void;
  setSessionOver:(value:boolean)=>void;
}

function WorkItemPage({ user,getUser, setSessionOver }:WorkItemPageProps) {

  // ===== STATE =====
  const [topSelector, setTopSelector] = useState<'All' | WorkItemStatus>('All')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [page, setPage] = useState(1)
  const [orderingType, setOrderingType] = useState<WorkItemOrdering>('-created_at')
  const [searchValue, setSearchValue] = useState('')
  const {  itemsError,
    creatingItem, createError, savingItemId, handleSaveAction, createWorkItem,
    handleDeleteWorkItem, deletingItemId, workItemListManager, draftManager } = useWorkItems({retryCount, topSelector, searchValue, orderingType, page, setPage,  setSessionOver, getUser})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [logouting,setLogouting]=useState(false)
  const full_error = itemsError || workItemListManager.listErrors

  async function logoutRequest() {
    setError('')
    try{
      setLogouting(true)
      await logout()
      getUser(null)
    }catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Did not receive an answer',
      )

    }finally{
      setLogouting(false)
    }
  }

  // ===== useEffect: search debounce =====
  useEffect(() => {
    const timeId = setTimeout(() => {
      setSearchValue(inputValue)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeId)
  }, [inputValue])


  // ===== useEffect: health check =====
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


  // ===== handleSubmit =====
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const success = await createWorkItem(title, description)
    if (success === true) {
      setTitle('');
      setDescription('');
    }

  }


  // ===== RENDER =====
  return (
    <main>
      <header className="workspace-header">
        <h1>OpsHub</h1>
        <button
          className="logout-button"
          type="button"
          onClick={()=>{logoutRequest()}}
          disabled={logouting}
        >Logout</button>
      </header>
      <p>{user && `Welcome ${user.username}`}</p>

      {/* ===== Health check ===== */}
      <button
        type="button"
        onClick={() => setRetryCount((previous) => previous + 1)}
        disabled={loading || workItemListManager.itemsLoading}
      >
        {loading || workItemListManager.itemsLoading ? 'Checking' : 'Checking again'}
      </button>

      {loading && <p>Checking connection with server</p>}
      {error && <p role="alert">Error: {error}</p>}

      {health && (
        <div>
          <p>Сервіс: {health.service}</p>
          <p>Статус: {health.status}</p>
        </div>
      )}
      <p></p>


      {/* ===== Filters: status, search, ordering ===== */}
      <label htmlFor="workitems">
        Choose Work Item
      </label>
      <select id="workitems"
        value={topSelector}
        onChange={(event) => {
          setTopSelector(event.target.value as 'All' | WorkItemStatus)
          setPage(1)
        }}>
        <option value="All">All</option>
        <option value="OP">Open</option>
        <option value="IP">In Progress</option>
        <option value="DN">Done</option>

      </select>
      <label htmlFor='search'>Search</label>
      <input
        id='search'
        className='search-button'
        placeholder='Search'
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value)
        }

        }
      />
      <select
        id='ordering'
        value={orderingType}
        onChange={(event) => {
          setOrderingType(event.target.value as WorkItemOrdering)
          setPage(1)
        }}>
        <option value='-created_at'>Newest first</option>
        <option value='created_at'>Oldest first</option>
      </select>


      {/* ===== Work items table ===== */}
      <div>
        <WorkItemsTable savingItemId={savingItemId}
          onSaveAction={handleSaveAction} onDeleteWorkItem={handleDeleteWorkItem} deletingItemId={deletingItemId} 
          draft={draftManager.draft} startEditing={draftManager.startEditing} cancelEditing={draftManager.cancelEditing} updateDraft={draftManager.updateDraft} workItemListManager={workItemListManager}
        />
      </div>


      {/* ===== Pagination ===== */}
      <div className="pagination">
        <button className="pagination__btn"
          onClick={() => {
            setPage(page - 1)
          }
          }
          disabled={workItemListManager.paginationInfo.previous === null}
        >Previous</button>
        <p className="pagination__info">Page {workItemListManager.paginationInfo.current_page} of {workItemListManager.paginationInfo.num_pages}</p>
        <button className="pagination__btn"
          onClick={() => {
            setPage(page + 1)
          }}
          disabled={workItemListManager.paginationInfo.next === null}>Next</button>
      </div>
      <p></p>


      {/* ===== Loading / error / empty messages ===== */}
      {workItemListManager.itemsLoading && <p>Loading work items</p>}
      {full_error && <p role="alert">Error: {full_error}</p>}

      {workItemListManager.workItems.length === 0 && !workItemListManager.itemsLoading && !full_error && (
        <p>There are no Work Items yet</p>
      )}


      {/* ===== Create form ===== */}
      <form
        className="workitem-form"
        onSubmit={handleSubmit}>
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

export default WorkItemPage
