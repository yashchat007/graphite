import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/opt/cursor/artifacts'
const BASE = 'http://127.0.0.1:5173'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

await page.goto(BASE)
await page.evaluate(() => {
  localStorage.setItem('graphite-access-key', 'screenshot-demo')
})
await page.reload()
await page.waitForSelector('text=Make things', { timeout: 15000 })

const sidebarStart = page.locator('aside').getByRole('button', { name: 'Start' })
await sidebarStart.click()
await page.keyboard.press('f')
await page.waitForTimeout(5200)
await page.waitForSelector('text=Press Esc to exit', { timeout: 5000 })
await page.waitForTimeout(400)

await page.screenshot({
  path: `${OUT}/graphite-focus-stopwatch.png`,
  fullPage: false,
})

await browser.close()
console.log('Saved', `${OUT}/graphite-focus-stopwatch.png`)
