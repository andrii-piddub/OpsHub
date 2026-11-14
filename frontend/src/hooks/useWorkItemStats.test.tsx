// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ApiErrors } from '../api/ApiError'
import { getDashboardStats } from '../api/workItemStats'
import type { DashboardStats } from '../api/workItemStats'
import { useWorkItemStats } from './useWorkItemStats'

vi.mock('../api/workItemStats', () => ({
    getDashboardStats: vi.fn(),
}))

beforeEach(() => {
    vi.mocked(getDashboardStats).mockReset()
})

afterEach(cleanup)

const mutationManager = { patchCount: 0 } as Parameters<typeof useWorkItemStats>[0]['mutationManager']

test('loads dashboard statistics', async () => {
    const response: DashboardStats = {
        dashboard_total: 10,
        dashboard_open: 4,
        dashboard_in_progress: 3,
        dashboard_done: 3,
        dashboard_high_priority: 2,
        dashboard_overdue: 1,
    }
    const handleErrors = vi.fn(async () => {})
    vi.mocked(getDashboardStats).mockResolvedValue(response)

    const { result } = renderHook(() =>
        useWorkItemStats({ mutationManager, handleErrors }),
    )

    await waitFor(() => {
        expect(result.current.dashboardStats).toEqual(response)
    })

    expect(result.current.dashboardErrors).toBe('')
    expect(getDashboardStats).toHaveBeenCalledExactlyOnceWith(expect.any(AbortSignal))
    expect(handleErrors).not.toHaveBeenCalled()
})

test('reports a dashboard loading error', async () => {
    const error = new ApiErrors('Internal server error', 500)
    const handleErrors = vi.fn(async () => {})
    vi.mocked(getDashboardStats).mockRejectedValue(error)

    const { result } = renderHook(() =>
        useWorkItemStats({ mutationManager, handleErrors }),
    )

    await waitFor(() => {
        expect(result.current.dashboardErrors).toBe(error.message)
    })

    expect(result.current.dashboardStats).toBeNull()
    expect(handleErrors).toHaveBeenCalledExactlyOnceWith(error, expect.any(AbortSignal))
    expect(getDashboardStats).toHaveBeenCalledTimes(1)
})
