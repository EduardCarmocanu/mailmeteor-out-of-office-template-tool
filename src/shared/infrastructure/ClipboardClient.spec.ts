import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClipboardUnavailableError, clipboardClient } from './ClipboardClient.ts'

const writeText = vi.fn<(text: string) => Promise<void>>()

describe('clipboardClient', () => {
  describe('writeText', () => {
    beforeEach(() => {
      writeText.mockReset().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      })
    })

    it('writes the text to the browser clipboard', async () => {
      await clipboardClient.writeText('Out of office until Monday')

      expect(writeText).toHaveBeenCalledExactlyOnceWith('Out of office until Monday')
    })

    it('rejects when the browser clipboard rejects', async () => {
      writeText.mockRejectedValue(new Error('Permission denied'))

      await expect(clipboardClient.writeText('Hello')).rejects.toThrow('Permission denied')
    })

    it('rejects with ClipboardUnavailableError when the clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })

      await expect(clipboardClient.writeText('Hello')).rejects.toBeInstanceOf(
        ClipboardUnavailableError,
      )
    })
  })
})
