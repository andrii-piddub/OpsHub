// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { Settings } from './Settings'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('submits the entered employee ID and displays an Acumatica authorization error', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 })
  vi.stubGlobal('fetch', fetchMock)
  const handleErrors = vi.fn(async () => {})

  render(<Settings handleErrors={handleErrors} />)
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'EMP001' } })
  fireEvent.click(screen.getByRole('button', { name: 'Find Employee in Acumatica' }))

  expect((await screen.findByRole('alert')).textContent).toBe('Request failed: 401')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, options] = fetchMock.mock.calls[0]
  expect(url.pathname).toBe('/api/v1/acumatica/employee/')
  expect(url.searchParams.get('employee_id')).toBe('EMP001')
  expect(options).toEqual({ credentials: 'include' })
  expect(handleErrors).toHaveBeenCalledTimes(1)
})
