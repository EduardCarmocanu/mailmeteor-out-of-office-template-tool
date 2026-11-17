import { test, expect, type Page } from '@playwright/test'
import {
  BACK_ON_LABEL,
  BACKUP_EMAIL,
  BACKUP_NAME,
  FIRST_DAY_AWAY_LABEL,
  LEAVE_END,
  LEAVE_START,
  PINNED_TODAY,
  SENDER_NAME,
  backupEmailField,
  backupNameField,
  expandAdvancedOptions,
  messageField,
  nameField,
  pickDateThroughHiddenNativeInput,
  reasonGroup,
  subjectField,
  toneGroup,
} from './support/page.ts'

const EXPECTED_SUBJECT = 'Gone (temporarily) until Jan 4'
const EXPECTED_BODY = [
  'Hey!',
  "Your email has arrived safely, but I haven't.",
  "I'm on a business trip from Monday, December 21 and will return to my inbox on Monday, January 4, coffee in hand.",
  "If it's truly urgent, Sam Patel (sam@company.com) has kindly agreed to be me while I'm away.",
  "Until then, your message will wait patiently. I'll reply once I'm back.",
  'Cheers,\nJordan Lee',
].join('\n\n')

const BODY_ADDITION = '\n\nP.S. Please resend anything time-sensitive after January 4.'
const EDITED_BODY = `${EXPECTED_BODY}${BODY_ADDITION}`

const readClipboard = (page: Page) => page.evaluate<string>('navigator.clipboard.readText()')

async function setEveryOptionToNonDefaultValue(page: Page) {
  await nameField(page).fill(SENDER_NAME)

  const firstDayAway = await pickDateThroughHiddenNativeInput(
    page,
    FIRST_DAY_AWAY_LABEL,
    LEAVE_START.iso,
  )
  await expect(firstDayAway).toHaveValue(LEAVE_START.display)

  const backOn = await pickDateThroughHiddenNativeInput(page, BACK_ON_LABEL, LEAVE_END.iso)
  await expect(backOn).toHaveValue(LEAVE_END.display)

  const funnyToneVisibleLabel = toneGroup(page).getByText('Funny', { exact: true })
  await funnyToneVisibleLabel.click()
  await expect(toneGroup(page).getByRole('radio', { name: 'Funny' })).toBeChecked()

  await expandAdvancedOptions(page)

  const businessTrip = reasonGroup(page).getByRole('button', { name: 'Business trip' })
  await businessTrip.click()
  await expect(businessTrip).toHaveAttribute('aria-pressed', 'true')

  await backupNameField(page).fill(BACKUP_NAME)
  await backupEmailField(page).fill(BACKUP_EMAIL)
}

test.describe('Template configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(PINNED_TODAY)
    await page.goto('/')
  })

  test('generates the subject and body from every configured option', async ({ page }) => {
    await setEveryOptionToNonDefaultValue(page)

    await expect(subjectField(page)).toHaveValue(EXPECTED_SUBJECT)
    await expect(messageField(page)).toHaveValue(EXPECTED_BODY)
    await expect(page.getByText('62 words')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset' })).toBeHidden()
  })

  test.describe('clipboard', () => {
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Only Chromium can grant clipboard-read and clipboard-write permissions',
    )
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

    test('copies the edited body and the subject to the clipboard', async ({ page }) => {
      await setEveryOptionToNonDefaultValue(page)
      const body = messageField(page)
      await expect(body).toHaveValue(EXPECTED_BODY)

      await body.fill(EDITED_BODY)

      await expect(body).toHaveValue(EDITED_BODY)
      await expect(page.getByText('Edited —')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible()

      await page.getByRole('button', { name: 'Copy message' }).click()
      await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
      await expect.poll(() => readClipboard(page)).toBe(EDITED_BODY)

      await page.getByRole('button', { name: 'Copy subject' }).click()
      await expect.poll(() => readClipboard(page)).toBe(EXPECTED_SUBJECT)
    })
  })
})
