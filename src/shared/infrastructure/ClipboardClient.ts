export class ClipboardUnavailableError extends Error {
  constructor() {
    super('The clipboard API is not available in this browser')
    this.name = 'ClipboardUnavailableError'
  }
}

export const clipboardClient = {
  async writeText(text: string): Promise<void> {
    if (!navigator.clipboard) throw new ClipboardUnavailableError()
    await navigator.clipboard.writeText(text)
  },
}
