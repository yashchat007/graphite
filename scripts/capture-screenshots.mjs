import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/opt/cursor/artifacts'
const BASE = 'http://127.0.0.1:5173'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

await page.goto(BASE)
await page.evaluate(() => {
  localStorage.setItem('graphite-access-key', 'screenshot-demo')
  localStorage.removeItem('graphite-store-v2')
  localStorage.removeItem('graphite-store-v1')
})
await page.reload()
await page.waitForSelector('text=Make things', { timeout: 15000 })
await page.waitForTimeout(900)

await page.screenshot({ path: `${OUT}/graphite-dashboard-desktop.png`, fullPage: false })

const firstMenu = page.locator('button[aria-label="Task menu"]').first()
await firstMenu.click()
await page.waitForTimeout(450)
await page.screenshot({ path: `${OUT}/graphite-task-menu-open.png`, fullPage: false })
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

await firstMenu.click()
await page.getByRole('menuitem', { name: 'Edit' }).click()
await page.waitForSelector('#task-modal-title', { timeout: 5000 })
await page.waitForTimeout(450)
await page.screenshot({ path: `${OUT}/graphite-edit-task-modal.png`, fullPage: false })
await page.getByRole('button', { name: 'Cancel' }).click()
await page.waitForTimeout(300)

await page.locator('aside').getByRole('button', { name: 'Completed', exact: true }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/graphite-completed-list.png`, fullPage: false })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/graphite-mobile-390.png`, fullPage: true })

await browser.close()
console.log('Screenshots saved to', OUT)
