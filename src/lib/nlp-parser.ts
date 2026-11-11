import { nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, startOfWeek, addWeeks, format, parse } from 'date-fns'
import { istTodayYmd, istTomorrowYmd } from './ist-time'

export interface ParsedToken {
  type: 'date' | 'time' | 'priority' | 'text'
  raw: string
  value?: string
  start: number
  end: number
}

const WEEKDAYS: Record<string, (d: Date) => Date> = {
  monday: nextMonday,
  mon: nextMonday,
  tuesday: nextTuesday,
  tue: nextTuesday,
  wednesday: nextWednesday,
  wed: nextWednesday,
  thursday: nextThursday,
  thu: nextThursday,
  friday: nextFriday,
  fri: nextFriday,
  saturday: nextSaturday,
  sat: nextSaturday,
  sunday: nextSunday,
  sun: nextSunday,
}

function parseTimeToken(raw: string): string | null {
  const lower = raw.toLowerCase()
  const m12 = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (m12) {
    let h = parseInt(m12[1], 10)
    const min = m12[2] ? parseInt(m12[2], 10) : 0
    if (m12[3] === 'pm' && h < 12) h += 12
    if (m12[3] === 'am' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  }
  const m24 = lower.match(/^(\d{1,2}):(\d{2})$/)
  if (m24) {
    return `${String(parseInt(m24[1], 10)).padStart(2, '0')}:${m24[2]}`
  }
  return null
}

export function tokenizeQuickAdd(input: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const words = input.split(/(\s+)/)
  let index = 0

  for (const part of words) {
    if (!part.trim()) {
      index += part.length
      continue
    }
    const start = index
    const end = index + part.length
    const lower = part.toLowerCase()

    if (lower === 'today') {
      tokens.push({ type: 'date', raw: part, value: istTodayYmd(), start, end })
    } else if (lower === 'tomorrow') {
      tokens.push({ type: 'date', raw: part, value: istTomorrowYmd(), start, end })
    } else if (lower === 'next' && input.slice(end).match(/^\s+week/i)) {
      const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })
      tokens.push({ type: 'date', raw: 'next week', value: format(nextWeekStart, 'yyyy-MM-dd'), start, end: end + 5 })
    } else if (WEEKDAYS[lower]) {
      tokens.push({ type: 'date', raw: part, value: format(WEEKDAYS[lower](new Date()), 'yyyy-MM-dd'), start, end })
    } else if (part.startsWith('!')) {
      const p = part.slice(1).toLowerCase()
      if (p === 'high' || p === 'low' || p === 'medium') {
        tokens.push({ type: 'priority', raw: part, value: p, start, end })
      } else {
        tokens.push({ type: 'text', raw: part, start, end })
      }
    } else {
      const time = parseTimeToken(part)
      if (time) {
        tokens.push({ type: 'time', raw: part, value: time, start, end })
      } else {
        tokens.push({ type: 'text', raw: part, start, end })
      }
    }
    index = end
  }
  return tokens
}

export function buildTaskFromQuickAdd(input: string): {
  title: string
  dueDate?: string
  dueTime?: string
  priority: 'high' | 'medium' | 'low' | 'none'
} {
  const tokens = tokenizeQuickAdd(input)
  const titleParts: string[] = []
  let dueDate: string | undefined
  let dueTime: string | undefined
  let priority: 'high' | 'medium' | 'low' | 'none' = 'none'

  for (const t of tokens) {
    if (t.type === 'text') titleParts.push(t.raw)
    if (t.type === 'date') dueDate = t.value
    if (t.type === 'time') dueTime = t.value
    if (t.type === 'priority' && t.value) priority = t.value as typeof priority
  }

  return {
    title: titleParts.join(' ').trim() || input.trim(),
    dueDate,
    dueTime,
    priority,
  }
}

export function parseDisplayTimeRange(dueTime?: string, endTime?: string): string {
  if (!dueTime) return ''
  const fmt = (t: string) => {
    try {
      const d = parse(t, 'HH:mm', new Date())
      return format(d, 'h:mm a')
    } catch {
      return t
    }
  }
  if (endTime) return `${fmt(dueTime)} – ${fmt(endTime)}`
  return fmt(dueTime)
}
