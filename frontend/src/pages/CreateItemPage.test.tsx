// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { ApiErrors } from '../api/ApiError'
import { postWorkItems } from '../api/workitems'
import type { WorkItem } from '../api/workitems'
import { CreateWorkitem } from './CreateItemPage'

vi.mock('../api/workitems', () => ({ postWorkItems: vi.fn() }))

function CurrentPath() {
  return <output aria-label="Current path">{useLocation().pathname}</output>
}

afterEach(() => {
  cleanup()
  vi.mocked(postWorkItems).mockReset()
})

test('creates a work item and navigates to the list only after POST succeeds', async () => {
  const handleErrors = vi.fn(async () => {})
  let completePost!: (item: WorkItem) => void
  vi.mocked(postWorkItems).mockReturnValue(new Promise<WorkItem>((resolve) => {
    completePost = resolve
  }))

  render(
    <MemoryRouter initialEntries={['/workitem/create']}>
      <Routes>
        <Route path="/workitem/create" element={<CreateWorkitem handleErrors={handleErrors} />} />
        <Route path="/workitem" element={<h1>Work items list</h1>} />
      </Routes>
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New support case' } })
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Investigate the issue' } })
  fireEvent.change(screen.getByLabelText('priority'), { target: { value: 'HI' } })
  fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-12-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

  expect(postWorkItems).toHaveBeenCalledExactlyOnceWith(
    'New support case', 'Investigate the issue', 'HI', '2026-12-01',
  )
  expect(screen.queryByRole('heading', { name: 'Work items list' })).toBeNull()
  expect((screen.getByRole('button', { name: 'Creating' }) as HTMLButtonElement).disabled).toBe(true)

  await act(async () => {
    completePost({
      id: 1,
      title: 'New support case',
      description: 'Investigate the issue',
      priority: 'HI',
      status: 'OP',
      due_date: '2026-12-01',
      created_at: '2026-11-15T10:00:00Z',
    })
  })

  expect(await screen.findByRole('heading', { name: 'Work items list' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull()
  expect(handleErrors).not.toHaveBeenCalled()
})

test('keeps the create route and entered fields and displays the HTTP error when POST fails', async () => {
  const handleErrors = vi.fn(async () => {})
  const error = new ApiErrors('Unable to create work item', 500)
  vi.mocked(postWorkItems).mockRejectedValue(error)

  render(
    <MemoryRouter initialEntries={['/workitem/create']}>
      <CurrentPath />
      <Routes>
        <Route path="/workitem/create" element={<CreateWorkitem handleErrors={handleErrors} />} />
        <Route path="/workitem" element={<h1>Work items list</h1>} />
      </Routes>
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New support case' } })
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Investigate the issue' } })
  fireEvent.change(screen.getByLabelText('priority'), { target: { value: 'HI' } })
  fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-12-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

  expect((await screen.findByRole('alert')).textContent).toBe('Error: Unable to create work item')
  expect(postWorkItems).toHaveBeenCalledExactlyOnceWith(
    'New support case', 'Investigate the issue', 'HI', '2026-12-01',
  )
  expect(handleErrors).toHaveBeenCalledExactlyOnceWith(error)
  expect(screen.getByLabelText('Current path').textContent).toBe('/workitem/create')
  expect(screen.queryByRole('heading', { name: 'Work items list' })).toBeNull()
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('New support case')
  expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('Investigate the issue')
  expect((screen.getByLabelText('priority') as HTMLSelectElement).value).toBe('HI')
  expect((screen.getByLabelText('Due Date') as HTMLInputElement).value).toBe('2026-12-01')
  expect((screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement).disabled).toBe(false)
})
