import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'

const BASE = process.env.PREVIEW_URL ?? 'http://127.0.0.1:43123'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()

const waitApp = async () => {
  await page.getByRole('heading', { name: /Make things/i }).waitFor({ timeout: 20000 })
}

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('graphite-access-key', 'dev-local-key')
})
await page.reload({ waitUntil: 'networkidle' })
const gate = page.getByLabel('Access key')
if (await gate.isVisible().catch(() => false)) {
  await gate.fill('dev-local-key')
  await page.getByRole('button', { name: 'Continue' }).click()
}
await waitApp()

await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(500)
await page.screenshot({
  path: `${OUT}/graphite-dashboard-ist-clock-1440.png`,
  fullPage: false,
})

await page.getByLabel('Quick add task').fill('Artifact quick add task')
await page.getByRole('button', { name: 'Add' }).click()
await page.waitForTimeout(400)
await page.screenshot({
  path: `${OUT}/graphite-quick-add-after-1440.png`,
  fullPage: false,
})

await page.getByRole('button', { name: 'Focus' }).click()
await page.locator('.fixed.inset-0.z-\\[60\\]').getByRole('button', { name: 'Start' }).click()
await page.waitForTimeout(1500)
await page.screenshot({
  path: `${OUT}/graphite-focus-stopwatch-1440.png`,
  fullPage: true,
})
await page.getByRole('button', { name: 'Exit focus mode' }).click()

await page.getByLabel('Sidebar').getByRole('button', { name: 'Completed' }).click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Delete all', exact: true }).first().click()
await page.waitForTimeout(200)
await page.screenshot({
  path: `${OUT}/graphite-completed-delete-confirm-1440.png`,
  fullPage: false,
})

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
await page.screenshot({
  path: `${OUT}/graphite-mobile-390.png`,
  fullPage: true,
})

await browser.close()
console.log('Saved PR artifacts to', OUT)
