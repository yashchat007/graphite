import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/opt/cursor/artifacts'
const BASE = 'http://127.0.0.1:5173'
const STORAGE = 'graphite-store-v2'

async function seedAndSetTheme(page, theme) {
  await page.evaluate(
    ({ themeId, storageKey }) => {
      localStorage.setItem('graphite-access-key', 'screenshot-demo')
      const payload = {
        state: {
          seeded: true,
          uiTheme: themeId,
          sidebarCollapsed: false,
        },
        version: 0,
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    },
    { themeId: theme, storageKey: STORAGE },
  )
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

const shots = [
  { theme: 'aurora', file: 'graphite-theme-aurora.png', openMenu: true },
  { theme: 'dusk', file: 'graphite-theme-dusk.png', openModal: true },
  { theme: 'lilac-peach', file: 'graphite-theme-lilac-peach.png', openMenu: true },
]

for (const shot of shots) {
  await page.goto(BASE)
  await seedAndSetTheme(page, shot.theme)
  await page.reload()
  await page.waitForSelector('text=Make things', { timeout: 15000 })
  await page.waitForTimeout(900)

  if (shot.openMenu) {
    await page.locator('button[aria-label="Task menu"]').first().click()
    await page.waitForTimeout(450)
  }
  if (shot.openModal) {
    await page.locator('button[aria-label="Task menu"]').first().click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    await page.waitForSelector('#task-modal-title', { timeout: 5000 })
    await page.waitForTimeout(450)
  }

  await page.screenshot({ path: `${OUT}/${shot.file}`, fullPage: false })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
}

await seedAndSetTheme(page, 'aurora')
await page.reload()
await page.waitForSelector('text=Make things', { timeout: 15000 })
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/graphite-theme-aurora-mobile.png`, fullPage: true })

await browser.close()
console.log('Theme screenshots saved to', OUT)
