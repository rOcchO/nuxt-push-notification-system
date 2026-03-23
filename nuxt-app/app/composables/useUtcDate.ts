export function useUtcDate() {

  /**
   * Convert local date (string || Date) to ISO UTC
   * Example : "2026-03-23T03:00" → "2026-03-23T02:00:00.000Z"
   */
  function toUtc(dateInput: string | Date): string {
    const date = new Date(dateInput)
    return date.toISOString()
  }

  /**
   * Convert UTC date to local date
   * Exemple : "2026-03-23T02:00:00.000Z" → "23/03/2026 03:00"
   */
  function toLocalString(utcString: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(utcString)
    return date.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
      ...options
    })
  }

  /**
   * Convert UTC date to compatible value <input type="datetime-local"> (for )
   * Example : "2026-03-23T02:00:00.000Z" → "2026-03-23T03:00"
   */
  function toLocalInputValue(utcString: string): string {
    const date = new Date(utcString)
    const pad = (n: number) => String(n).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return {
    toUtc,
    toLocalString,
    toLocalInputValue
  }
}
