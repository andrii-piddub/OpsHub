import { useState, useEffect } from 'react'
import WorkItemsTable from '../components/WorkItemsTable.tsx'
import type { WorkItemStatus, WorkItemOrdering, WorkItemPriority } from '../api/workitems'
import { useWorkItemsList } from '../hooks/useWorkItemsList.ts'
import { useWorkItemMutations } from '../hooks/useWorkItemMutations.ts'
import {useWorkItemDraft} from '../hooks/useWorkItemDraft.ts'

export type PrioritySortSelectorPar = 'FHL' | 'FLH' | ''
export type DeadlinePar = 'All' | 'OD' | 'DT' | 'ND'

export type WorkItemPageProps = {
  handleErrors: (error: unknown,
        signal?: AbortSignal) => Promise<void>;

}


function WorkItemPage({ handleErrors }: WorkItemPageProps) {

  // ===== STATE =====
  const [topSelector, setTopSelector] = useState<'All' | WorkItemStatus>('All')
  const [prioritySelector, setPrioritySelector] = useState<'All' | WorkItemPriority>('All')
  const [prioritySortSelector, setPrioritySortSelector] = useState<PrioritySortSelectorPar>('')
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlinePar>('All')
  const priorities: { value: WorkItemPriority; label: string }[] = [
    { value: 'LO', label: 'Low' },
    { value: 'ME', label: 'Medium' },
    { value: 'HI', label: 'High' },
  ]


  const [page, setPage] = useState(1)
  const [orderingType, setOrderingType] = useState<WorkItemOrdering>('-created_at')
  const [searchValue, setSearchValue] = useState('')




  const [inputValue, setInputValue] = useState('')
  const draftManager = useWorkItemDraft()
  const workItemListManager = useWorkItemsList({ topSelector, searchValue, orderingType, page, prioritySelector, prioritySortSelector, deadlineFilter, handleErrors})
  const mutationManager = useWorkItemMutations({ draftManager, topSelector, searchValue, workItemListManager, page, setPage, handleErrors, prioritySelector, deadlineFilter })
  const full_error = mutationManager.itemsError || workItemListManager.listErrors






  // ===== useEffect: search debounce =====
  useEffect(() => {
    const timeId = setTimeout(() => {
      setSearchValue(inputValue)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeId)
  }, [inputValue])




  // ===== RENDER =====
  return (
    <main>

      <p></p>


      <section className="workitem-filters" aria-label="Work item filters and sorting">
        <fieldset className="workitem-filter-group">
          <legend>Filtering</legend>
          <div className="workitem-filter-grid">
            <label htmlFor="search">Search
              <input id="search" type="search" placeholder="Search WorkItems..." value={inputValue}
                onChange={(event) => setInputValue(event.target.value)} />
            </label>
            <label htmlFor="workitems">Status
              <select id="workitems" value={topSelector} onChange={(event) => {
                setTopSelector(event.target.value as 'All' | WorkItemStatus)
                setPage(1)
              }}>
                <option value="All">All statuses</option>
                <option value="OP">Open</option>
                <option value="IP">In Progress</option>
                <option value="DN">Done</option>
              </select>
            </label>
            <label htmlFor="filter-priority">Priority filter
              <select id="filter-priority" value={prioritySelector} onChange={(event) => {
                setPrioritySelector(event.target.value as 'All' | WorkItemPriority)
                setPage(1)
              }}>
                <option value="All">All priorities</option>
                <option value="LO">Low</option>
                <option value="ME">Medium</option>
                <option value="HI">High</option>
              </select>
            </label>
            <label htmlFor="deadlineFilter">Deadline filter
              <select
                id="deadlineFilter"
                value={deadlineFilter}
                onChange={(event) => {
                  setDeadlineFilter(event.target.value as DeadlinePar)
                  setPage(1)

                }}

              >
                <option value="All">All deadlines</option>
                <option value="OD">Overdue</option>
                <option value="DT"> Due today</option>
                <option value="ND">Next 7 days</option>
              </select>
            </label>
          </div>
        </fieldset>
        <fieldset className="workitem-filter-group">
          <legend>Sorting</legend>
          <div className="workitem-filter-grid">
            <label htmlFor="sort-priority">Priority sort
              <select id="sort-priority" value={prioritySortSelector} onChange={(event) => {
                setPrioritySortSelector(event.target.value as PrioritySortSelectorPar)
                setPage(1)
              }}>
                <option value="">Default</option>
                <option value="FHL">From high to low</option>
                <option value="FLH">From low to high</option>
              </select>
            </label>
            <label htmlFor="ordering">Date sort
              <select id="ordering" value={orderingType} onChange={(event) => {
                setOrderingType(event.target.value as WorkItemOrdering)
                setPage(1)
              }}>
                <option value="-created_at">Newest first</option>
                <option value="created_at">Oldest first</option>
              </select>
            </label>
          </div>
        </fieldset>
      </section>
      {/* ===== Work items table ===== */}
      <div>
        <WorkItemsTable savingItemId={mutationManager.savingItemId}
          onSaveAction={mutationManager.handleSaveAction} onDeleteWorkItem={mutationManager.handleDeleteWorkItem} deletingItemId={mutationManager.deletingItemId}
          draft={draftManager.draft} startEditing={draftManager.startEditing} cancelEditing={draftManager.cancelEditing} updateDraft={draftManager.updateDraft} workItemListManager={workItemListManager}
          priorities={priorities}
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
    </main>
  )
}

export default WorkItemPage