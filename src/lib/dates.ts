/**
 * Shared date utilities — local timezone-aware (not UTC).
 * All functions use local timezone to avoid the Israel UTC+2/+3 shift bug.
 */

/** Format a Date to YYYY-MM-DD using LOCAL timezone (not UTC) */
export function toLocalDateStr(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/** Get the Sunday (start of week) for a given date */
export function getSundayDate(d: Date): Date {
    const day = d.getDay()
    const sun = new Date(d)
    sun.setDate(d.getDate() - day)
    sun.setHours(0, 0, 0, 0)
    return sun
}

/** Get this week's Sunday as YYYY-MM-DD string */
export function getThisSunday(): string {
    return toLocalDateStr(getSundayDate(new Date()))
}

/** Format a week range string like "Feb 16 — Feb 22, 2026" */
export function formatWeekRange(sundayStr: string): string {
    const sun = new Date(sundayStr + 'T12:00:00')
    const sat = new Date(sun)
    sat.setDate(sun.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${sun.toLocaleDateString('en-US', opts)} — ${sat.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

/** Shift a YYYY-MM-DD string forward/backward by N weeks */
export function shiftWeek(dateStr: string, weeks: number): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + weeks * 7)
    return toLocalDateStr(d)
}

/** Get the Date object for a specific day-of-week offset from a Sunday string */
export function getDateForDow(sundayStr: string, dow: number): Date {
    const sun = new Date(sundayStr + 'T12:00:00')
    const d = new Date(sun)
    d.setDate(sun.getDate() + dow)
    return d
}
