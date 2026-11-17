import process from 'node:process'
import { test, expect, type Page } from '@playwright/test'

const PINNED_TODAY = new Date('2026-12-01T10:00:00')

const NAME = 'Jordan Lee'
const BACKUP_NAME = 'Sam Patel'
const BACKUP_EMAIL = 'sam@company.com'

const FIRST_DAY_AWAY_ISO = '2026-12-21'
const BACK_ON_ISO = '2027-01-04'

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

async function pickDateThroughHiddenNativeCalendarInput(
  page: Page,
  label: string,
  isoDate: string,
) {
  const readonlyDisplayField = page.getByRole('textbox', { name: label, exact: true })
  const nativeCalendarInput = page
    .locator('.date-input', { has: readonlyDisplayField })
    .locator('input[type="date"]')
  await nativeCalendarInput.fill(isoDate)
  return readonlyDisplayField
}

const subjectField = (page: Page) => page.getByRole('textbox', { name: 'Subject' })
const bodyField = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true })

const MOVE_CARET_TO_END_OF_TEXT_SHORTCUT =
  process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End'

const readClipboard = (page: Page) => page.evaluate<string>('navigator.clipboard.readText()')

async function setEveryOptionToNonDefaultValue(page: Page) {
  await page.getByRole('textbox', { name: 'Your Name' }).fill(NAME)

  const firstDayAway = await pickDateThroughHiddenNativeCalendarInput(
    page,
    'First day away',
    FIRST_DAY_AWAY_ISO,
  )
  await expect(firstDayAway).toHaveValue('21/12/2026')

  const backOn = await pickDateThroughHiddenNativeCalendarInput(page, 'Back on', BACK_ON_ISO)
  await expect(backOn).toHaveValue('04/01/2027')

  const tones = page.getByRole('radiogroup', { name: 'Tone' })
  const funnyToneVisibleLabel = tones.getByText('Funny', { exact: true })
  await funnyToneVisibleLabel.click()
  await expect(tones.getByRole('radio', { name: 'Funny' })).toBeChecked()

  const advancedOptions = page.getByRole('button', { name: 'Advanced options' })
  await advancedOptions.click()
  await expect(advancedOptions).toHaveAttribute('aria-expanded', 'true')

  const businessTrip = page
    .getByRole('group', { name: 'Reason' })
    .getByRole('button', { name: 'Business trip' })
  await businessTrip.click()
  await expect(businessTrip).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('textbox', { name: 'Backup contact' }).fill(BACKUP_NAME)
  await page.getByRole('textbox', { name: 'Their email' }).fill(BACKUP_EMAIL)
}

const headlessKeepsEachBrowserClipboardIsolatedFromParallelWorkers = true
test.use({ headless: headlessKeepsEachBrowserClipboardIsolatedFromParallelWorkers })

test.describe('Template configuration', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(PINNED_TODAY)
    await page.goto('/')
  })

  test('generates the subject and body from every configured option', async ({ page }) => {
    await setEveryOptionToNonDefaultValue(page)

    await expect(subjectField(page)).toHaveValue(EXPECTED_SUBJECT)
    await expect(bodyField(page)).toHaveValue(EXPECTED_BODY)
    await expect(page.getByText('62 words')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset' })).toBeHidden()
  })

  test('copies the edited body and the subject to the clipboard', async ({ page }) => {
    await setEveryOptionToNonDefaultValue(page)
    const body = bodyField(page)
    await expect(body).toHaveValue(EXPECTED_BODY)

    await body.focus()
    await body.press(MOVE_CARET_TO_END_OF_TEXT_SHORTCUT)
    await body.pressSequentially(BODY_ADDITION)

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
