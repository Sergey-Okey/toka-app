export const useDate = () => {
  const formatDate = (
    date: Date,
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }

    return date.toLocaleDateString('ru-RU', { ...defaultOptions, ...options })
  }

  return {
    formatDate,
  }
}
