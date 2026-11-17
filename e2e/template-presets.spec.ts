import { test, expect, type Page } from '@playwright/test'

const REASONS = [
  'Vacation',
  'Holidays',
  'Business trip',
  'Conference',
  'Sick leave',
  'Parental leave',
] as const
const TONES = ['Formal', 'Friendly', 'Funny', 'Short'] as const

const DEFAULT_REASON: ReasonLabel = 'Vacation'
const DEFAULT_TONE: ToneLabel = 'Formal'

type ReasonLabel = (typeof REASONS)[number]
type ToneLabel = (typeof TONES)[number]

interface PresetExpectation {
  description: string
  reason: ReasonLabel
  tone: ToneLabel
  subject: string
  body: string
}

const FIELDS_NOT_SET_BY_PRESETS = {
  name: 'Jordan Lee',
  leaveStartIso: '2026-12-21',
  leaveStartDisplay: '21/12/2026',
  leaveEndIso: '2027-01-04',
  leaveEndDisplay: '04/01/2027',
  backupName: 'Sam Patel',
  backupEmail: 'sam@company.com',
}

const PRESETS_IN_CLICK_ORDER: PresetExpectation[] = [
  {
    description:
      "I'm off for the holidays. Let clients know who to contact if something is urgent.",
    reason: 'Holidays',
    tone: 'Formal',
    subject: 'Out of office until Jan 4',
    body: [
      'Hello,',
      'Thank you for your email. I am away for the holidays from Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
      'For urgent matters, please contact Sam Patel (sam@company.com).',
      'I will respond to your message as soon as possible after my return.',
      'Kind regards,\nJordan Lee',
    ].join('\n\n'),
  },
  {
    description: "I'm on vacation. Tell my team I'm fully offline and will catch up when I'm back.",
    reason: 'Vacation',
    tone: 'Friendly',
    subject: 'Away until Jan 4',
    body: [
      'Hi there!',
      "Thanks so much for reaching out. I'm on vacation from Monday, December 21 and will be back on Monday, January 4.",
      "If something can't wait, Sam Patel (sam@company.com) will be happy to help.",
      "I'll get back to you as soon as I can once I'm back.",
      'Talk soon,\nJordan Lee',
    ].join('\n\n'),
  },
  {
    description:
      "I'm at a conference with limited access to email. Keep it short and professional for clients.",
    reason: 'Conference',
    tone: 'Short',
    subject: 'Out of office until Jan 4',
    body: [
      "I'm at a conference until Monday, January 4.",
      'For anything urgent, contact Sam Patel (sam@company.com).',
      'Thanks,\nJordan Lee',
    ].join('\n\n'),
  },
  {
    description:
      "I'm going on parental leave. Point people to the colleague who's covering my work.",
    reason: 'Parental leave',
    tone: 'Formal',
    subject: 'Out of office until Jan 4',
    body: [
      'Hello,',
      'Thank you for your email. I am on parental leave from Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
      'For urgent matters, please contact Sam Patel (sam@company.com).',
      'I will respond to your message as soon as possible after my return.',
      'Kind regards,\nJordan Lee',
    ].join('\n\n'),
  },
]

const FIXED_TODAY = new Date(2026, 10, 17, 10, 0, 0)

const presetButton = (page: Page, description: string) =>
  page.getByRole('button', { name: description, exact: true })

const reasonGroup = (page: Page) => page.getByRole('group', { name: 'Reason' })
const toneGroup = (page: Page) => page.getByRole('radiogroup', { name: 'Tone' })

const nameField = (page: Page) => page.getByRole('textbox', { name: 'Your Name' })
const leaveStartField = (page: Page) =>
  page.getByRole('textbox', { name: 'First day away', exact: true })
const leaveEndField = (page: Page) => page.getByRole('textbox', { name: 'Back on', exact: true })
const backupNameField = (page: Page) => page.getByRole('textbox', { name: 'Backup contact' })
const backupEmailField = (page: Page) => page.getByRole('textbox', { name: 'Their email' })
const subjectField = (page: Page) => page.getByRole('textbox', { name: 'Subject:' })
const messageField = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true })

async function fillHiddenNativeDateInput(page: Page, label: string, isoDate: string) {
  await page
    .locator('.date-input')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('input[type="date"]')
    .fill(isoDate)
}

async function expandAdvancedOptions(page: Page) {
  const toggle = page.getByRole('button', { name: /Advanced options/ })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
}

async function expectSelectedReason(page: Page, selected: ReasonLabel) {
  for (const reason of REASONS) {
    await expect(
      reasonGroup(page).getByRole('button', { name: reason, exact: true }),
      `reason "${reason}"`,
    ).toHaveAttribute('aria-pressed', String(reason === selected))
  }
}

async function expectSelectedTone(page: Page, selected: ToneLabel) {
  for (const tone of TONES) {
    const radio = toneGroup(page).getByRole('radio', { name: tone, exact: true })
    if (tone === selected) {
      await expect(radio, `tone "${tone}"`).toBeChecked()
    } else {
      await expect(radio, `tone "${tone}"`).not.toBeChecked()
    }
  }
}

async function expectKeptFields(page: Page) {
  await expect(nameField(page)).toHaveValue(FIELDS_NOT_SET_BY_PRESETS.name)
  await expect(leaveStartField(page)).toHaveValue(FIELDS_NOT_SET_BY_PRESETS.leaveStartDisplay)
  await expect(leaveEndField(page)).toHaveValue(FIELDS_NOT_SET_BY_PRESETS.leaveEndDisplay)
  await expect(backupNameField(page)).toHaveValue(FIELDS_NOT_SET_BY_PRESETS.backupName)
  await expect(backupEmailField(page)).toHaveValue(FIELDS_NOT_SET_BY_PRESETS.backupEmail)
}

test.describe('Template presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_TODAY)
    await page.goto('/')
  })

  test('shows one clickable panel per preset', async ({ page }) => {
    const presets = page.getByRole('button').filter({ hasText: /^I'm / })

    await expect(presets).toHaveText(PRESETS_IN_CLICK_ORDER.map((preset) => preset.description))
  })

  test('applies the reason and tone of each preset in turn, keeping the other fields', async ({
    page,
  }) => {
    await nameField(page).fill(FIELDS_NOT_SET_BY_PRESETS.name)
    await fillHiddenNativeDateInput(page, 'First day away', FIELDS_NOT_SET_BY_PRESETS.leaveStartIso)
    await fillHiddenNativeDateInput(page, 'Back on', FIELDS_NOT_SET_BY_PRESETS.leaveEndIso)
    await expandAdvancedOptions(page)
    await backupNameField(page).fill(FIELDS_NOT_SET_BY_PRESETS.backupName)
    await backupEmailField(page).fill(FIELDS_NOT_SET_BY_PRESETS.backupEmail)

    await expectSelectedReason(page, DEFAULT_REASON)
    await expectSelectedTone(page, DEFAULT_TONE)
    await expectKeptFields(page)

    for (const preset of PRESETS_IN_CLICK_ORDER) {
      await test.step(`apply "${preset.description}"`, async () => {
        await presetButton(page, preset.description).click()

        await expectSelectedReason(page, preset.reason)
        await expectSelectedTone(page, preset.tone)
        await expectKeptFields(page)

        await expect(subjectField(page)).toHaveValue(preset.subject)
        await expect(messageField(page)).toHaveValue(preset.body)
        await expect(page.getByText('Edited —')).toBeHidden()
      })
    }
  })

  test('keeps placeholders for unfilled fields when a preset is applied', async ({ page }) => {
    const [holidays] = PRESETS_IN_CLICK_ORDER

    await presetButton(page, holidays!.description).click()
    await expandAdvancedOptions(page)

    await expectSelectedReason(page, 'Holidays')
    await expectSelectedTone(page, 'Formal')
    await expect(nameField(page)).toHaveValue('')
    await expect(leaveStartField(page)).toHaveValue('')
    await expect(leaveEndField(page)).toHaveValue('')
    await expect(backupNameField(page)).toHaveValue('')
    await expect(backupEmailField(page)).toHaveValue('')

    await expect(subjectField(page)).toHaveValue('Out of office')
    await expect(messageField(page)).toHaveValue(
      [
        'Hello,',
        'Thank you for your email. I am away for the holidays from [first day away] and will be back on [back on], with limited access to email in the meantime.',
        'I will respond to your message as soon as possible after my return.',
        'Kind regards,\n[Your name]',
      ].join('\n\n'),
    )
  })

  test('applies a preset activated with the keyboard', async ({ page }) => {
    const [, , conference] = PRESETS_IN_CLICK_ORDER

    await presetButton(page, conference!.description).focus()
    await page.keyboard.press('Enter')
    await expandAdvancedOptions(page)

    await expectSelectedReason(page, 'Conference')
    await expectSelectedTone(page, 'Short')
    await expect(messageField(page)).toHaveValue(
      "I'm at a conference until [back on].\n\nThanks,\n[Your name]",
    )
  })

  test('replaces manual message edits with the message generated for the preset', async ({
    page,
  }) => {
    const [, vacation] = PRESETS_IN_CLICK_ORDER

    await messageField(page).fill('My own message')
    await expect(page.getByText('Edited —')).toBeVisible()

    await presetButton(page, vacation!.description).click()

    await expect(subjectField(page)).toHaveValue('Away')
    await expect(messageField(page)).toHaveValue(
      [
        'Hi there!',
        "Thanks so much for reaching out. I'm on vacation from [first day away] and will be back on [back on].",
        "I'll get back to you as soon as I can once I'm back.",
        'Talk soon,\n[Your name]',
      ].join('\n\n'),
    )
    await expect(page.getByText('Edited —')).toBeHidden()
  })
})
