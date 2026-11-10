// @vitest-environment jsdom

import { expect, test } from 'vitest'
import { useWorkItemDraft } from './useWorkItemDraft'
import { renderHook } from '@testing-library/react'
import { act } from '@testing-library/react'
import type{ WorkItem } from '../api/workitems'

const item: WorkItem = { id: 1, title: 'New', description: 'New Description', priority: 'ME', status: 'IP', created_at: '2026-11-10T10:00:00Z', }
test('returns logged in user', () => {
    const { result } = renderHook(() => useWorkItemDraft())
    expect(result.current.draft.draftId).toBeNull()
})


test('update draft', () => {
    const { result } = renderHook(() => useWorkItemDraft())

    act(() => {
        result.current.startEditing(item)
    })
    expect(result.current.draft).toEqual({
        draftId: 1,
        draftTitle: 'New',
        draftDescription: 'New Description',
        draftPriority: 'ME',
        draftStatus: 'IP'
    })
})

test('partial update draft', () => {
    const { result } = renderHook(() => useWorkItemDraft())
    act(() => {
        result.current.startEditing(item)
    })
    act(() => {
        result.current.updateDraft({ draftTitle: 'New title' })
    })
    expect(result.current.draft).toEqual({
        draftId: 1,
        draftTitle: 'New title',
        draftDescription: 'New Description',
        draftPriority: 'ME',
        draftStatus: 'IP'
    })

})