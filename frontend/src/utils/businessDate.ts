import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const BUSINESS_TIME_ZONE = 'Europe/Kyiv'

export function getBusinessDateRange(now: Date = new Date()) {
    const today = dayjs(now).tz(BUSINESS_TIME_ZONE)
    return {
        today: today.format('YYYY-MM-DD'),
        range_seven_days: today.add(7, 'day').format('YYYY-MM-DD'),
    }
}
