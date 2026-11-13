import { expect, test } from 'vitest'
import { getBusinessDateRange } from './businessDate'

test('uses the Kyiv calendar date before UTC midnight in winter', () => {
    expect(getBusinessDateRange(new Date('2026-11-13T22:30:00Z'))).toEqual({
        today: '2026-11-14',
        range_seven_days: '2026-11-21',
    })
})

test('uses the Kyiv summer offset', () => {
    expect(getBusinessDateRange(new Date('2026-07-01T21:30:00Z')).today).toBe('2026-07-02')
})

test('adds seven calendar days across the daylight saving transition', () => {
    expect(getBusinessDateRange(new Date('2026-03-25T22:30:00Z'))).toEqual({
        today: '2026-03-26',
        range_seven_days: '2026-04-02',
    })
})
