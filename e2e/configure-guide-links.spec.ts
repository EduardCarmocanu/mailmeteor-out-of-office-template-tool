import { test, expect } from '@playwright/test'

const CONFIGURE_LINKS = ['Configure in Gmail', 'Configure in Outlook'] as const

test.describe('Configure guide links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const linkName of CONFIGURE_LINKS) {
    test(`"${linkName}" opens an existing page in a new tab`, async ({ page }) => {
      const link = page.getByRole('link', { name: linkName, exact: true })
      await expect(link).toHaveAttribute('href', /^https:\/\//)
      const href = (await link.getAttribute('href')) ?? ''

      const appUrl = page.url()
      const newTabOpened = page.waitForEvent('popup')
      await link.click()
      const newTab = await newTabOpened

      await newTab.waitForURL(href, { waitUntil: 'commit' })
      expect(page.url()).toBe(appUrl)

      const response = await page.request.get(href)
      expect(response.status(), `${href} answered with ${response.status()}`).toBe(200)
      expect(new URL(response.url()).pathname).toBe(new URL(href).pathname)
    })
  }
})
