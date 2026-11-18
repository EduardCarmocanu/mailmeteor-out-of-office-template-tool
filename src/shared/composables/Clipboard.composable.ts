import { onScopeDispose, ref } from 'vue'
import { clipboardClient } from '../infrastructure/ClipboardClient.ts'

export type CopyStatus = 'idle' | 'copied' | 'error'

const DEFAULT_FEEDBACK_DURATION_MS = 2000

export function useClipboard({ feedbackDurationMs = DEFAULT_FEEDBACK_DURATION_MS } = {}) {
  const status = ref<CopyStatus>('idle')
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  function clearResetTimer() {
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer)
      resetTimer = undefined
    }
  }

  function reset() {
    clearResetTimer()
    status.value = 'idle'
  }

  function showFeedback(next: Exclude<CopyStatus, 'idle'>) {
    clearResetTimer()
    status.value = next
    resetTimer = setTimeout(() => {
      status.value = 'idle'
      resetTimer = undefined
    }, feedbackDurationMs)
  }

  async function copy(text: string) {
    try {
      await clipboardClient.writeText(text)
      showFeedback('copied')
    } catch {
      showFeedback('error')
    }
  }

  onScopeDispose(clearResetTimer)

  return { status, copy, reset }
}
