export const queryParamClient = {
  getAll(): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(window.location.search))
  },

  update(params: Record<string, string | null>): void {
    const url = new URL(window.location.href)
    for (const [key, value] of Object.entries(params)) {
      if (value === null) url.searchParams.delete(key)
      else url.searchParams.set(key, value)
    }
    if (url.href === window.location.href) return
    window.history.replaceState(window.history.state, '', url)
  },
}
