import { addDays, format, parseISO } from 'date-fns'

const IST = 'Asia/Kolkata'

/** Calendar date yyyy-MM-dd in India Standard Time. */
export function istYmd(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function istTodayYmd(): string {
  return istYmd(new Date())
}

export function istTomorrowYmd(): string {
  return format(addDays(parseISO(istTodayYmd()), 1), 'yyyy-MM-dd')
}

export function istStartOfToday(): Date {
  return parseISO(istTodayYmd())
}

export function istAddDaysFromToday(days: number): string {
  return format(addDays(istStartOfToday(), days), 'yyyy-MM-dd')
}

const clockTime = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const clockDate = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

/** e.g. "10:12 PM IST" and "Wed, Nov 12" */
export function formatIstClock(date: Date = new Date()): { time: string; date: string } {
  return {
    time: `${clockTime.format(date)} IST`,
    date: clockDate.format(date),
  }
}
