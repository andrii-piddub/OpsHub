// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { getWorkItems } from '../api/workitems'
import type { WorkItemsResponse } from '../api/workitems'
import { useWorkItemsList } from './useWorkItemsList'


vi.mock('../api/workitems', () => ({
    getWorkItems: vi.fn(),
}))

test('get workItems list', async () => {
    const response: WorkItemsResponse = {
        results: [
            {
                id: 1,
                title: 'First title',
                description: 'First description',
                status: 'IP',
                priority: 'HI',
                created_at: '2026-11-10T10:00:00Z'
            },
        ],
        count: 1,
        num_pages: 1,
        current_page: 1,
        next: null,
        previous: null,
    }
    vi.mocked(getWorkItems).mockResolvedValue(response)

    const { result } = renderHook(() =>
        useWorkItemsList({
            retryCount: 0,
            topSelector: 'All',
            searchValue: '',
            orderingType: '-created_at',
            page: 1,
            handleErrors: vi.fn(async () => { }),
        })
    )



    await waitFor(() => {
        expect(result.current.itemsLoading).toBe(false)
    })

    expect(result.current.workItems).toEqual(response.results)
    expect(result.current.listErrors).toBe('')
})