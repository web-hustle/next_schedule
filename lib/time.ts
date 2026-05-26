import { formatDistanceToNow, isPast, isToday, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { toZonedTime, fromZonedTime, format } from "date-fns-tz"

export const KST = "Asia/Seoul"

export function nowKST(): Date {
  return toZonedTime(new Date(), KST)
}

export function nowKSTIso(): string {
  return format(toZonedTime(new Date(), KST), "yyyy-MM-dd'T'HH:mm:ssXXX", {
    timeZone: KST,
  })
}

export function toKST(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date
  return toZonedTime(d, KST)
}

export function fromKST(date: Date): Date {
  return fromZonedTime(date, KST)
}

export function formatRelativeDueDate(due: string | null | undefined): string {
  if (!due) return ""
  const d = parseISO(due)
  if (isPast(d) && !isToday(d)) return "지남"
  if (isToday(d)) return "오늘"
  return formatDistanceToNow(d, { addSuffix: true, locale: ko })
}

export function endOfMonthKST(): Date {
  const now = nowKST()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return fromKST(last)
}
