// @vitest-environment jsdom

import { expect, test } from 'vitest'
import { useWorkItemDraft } from './useWorkItemDraft'
import { renderHook } from '@testing-library/react'
import { act } from '@testing-library/react'
import type { WorkItem } from '../api/workitems'

const item: WorkItem = { id: 1, title: 'New', description: 'New Description', priority: 'ME', status: 'IP', created_at: '2026-11-10T10:00:00Z', }
const item2: WorkItem = { id: 2, title: 'Second', description: 'Second Description', priority: 'HI', status: 'OP', created_at: '2026-11-10T10:00:00Z', }

test('initial draftId is null', () => {
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

test('start and cancel draft', () => {
    const { result } = renderHook(() => useWorkItemDraft())
    act(() => {
        result.current.startEditing(item)
    })
    act(() => {
        result.current.cancelEditing()
    })
    expect(result.current.draft.draftId).toBeNull()
})

test('draft two items', () => {
    const { result } = renderHook(() => useWorkItemDraft())
        act(() => {
        result.current.startEditing(item)
    })
        act(() => {
        result.current.startEditing(item2)
    })
        expect(result.current.draft).toEqual({
        draftId: 2,
        draftTitle: 'Second',
        draftDescription: 'Second Description',
        draftPriority: 'HI',
        draftStatus: 'OP'
    })
})

