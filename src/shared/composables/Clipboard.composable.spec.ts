import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { clipboardClient } from '../infrastructure/ClipboardClient.ts'
import { useClipboard } from './Clipboard.composable.ts'

vi.mock('../infrastructure/ClipboardClient.ts', () => ({
  clipboardClient: { writeText: vi.fn<(text: string) => Promise<void>>() },
}))

const writeText = vi.mocked(clipboardClient.writeText)

function setup(options?: Parameters<typeof useClipboard>[0]) {
  const scope = effectScope()
  const clipboard = scope.run(() => useClipboard(options))!
  return { scope, ...clipboard }
}

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    writeText.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts idle', () => {
    const { status } = setup()

    expect(status.value).toBe('idle')
  })

  describe('copy', () => {
    it('writes the text through the clipboard client', async () => {
      const { copy } = setup()

      await copy('Out of office until Monday')

      expect(writeText).toHaveBeenCalledExactlyOnceWith('Out of office until Monday')
    })

    it('sets the status to copied when writing succeeds', async () => {
      const { status, copy } = setup()

      await copy('Hello')

      expect(status.value).toBe('copied')
    })

    it('sets the status to error when writing fails', async () => {
      writeText.mockRejectedValue(new Error('Permission denied'))
      const { status, copy } = setup()

      await copy('Hello')

      expect(status.value).toBe('error')
    })

    it('returns to idle after the default 2 seconds', async () => {
      const { status, copy } = setup()
      await copy('Hello')

      vi.advanceTimersByTime(1999)
      expect(status.value).toBe('copied')

      vi.advanceTimersByTime(1)
      expect(status.value).toBe('idle')
    })

    it('returns to idle after a custom feedback duration', async () => {
      const { status, copy } = setup({ feedbackDurationMs: 500 })
      await copy('Hello')

      vi.advanceTimersByTime(500)

      expect(status.value).toBe('idle')
    })

    it('restarts the feedback window when called again', async () => {
      const { status, copy } = setup()
      await copy('Hello')

      vi.advanceTimersByTime(1500)
      await copy('Hello')
      vi.advanceTimersByTime(1500)

      expect(status.value).toBe('copied')
    })
  })

  describe('reset', () => {
    it('returns to idle and cancels the pending reset timer', async () => {
      const { status, copy, reset } = setup()
      await copy('Hello')

      reset()

      expect(status.value).toBe('idle')
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  it('clears the pending reset timer when its scope is disposed', async () => {
    const { scope, copy } = setup()
    await copy('Hello')
    expect(vi.getTimerCount()).toBe(1)

    scope.stop()

    expect(vi.getTimerCount()).toBe(0)
  })
})
