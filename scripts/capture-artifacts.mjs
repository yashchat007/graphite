import { chromium } from 'playwright'
import { mkdir, rename } from 'fs/promises'
import { readdir } from 'fs/promises'

const BASE = 'http://127.0.0.1:43123'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

await page.addInitScript(() => {
  localStorage.clear()
})

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.getByText('Enter access key').waitFor({ timeout: 15000 })
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/graphite-access-key.png` })

await page.getByLabel('Access key').fill('dev-local-key')
await page.getByRole('button', { name: 'Continue' }).click()
await page.getByText('Make things', { exact: false }).waitFor({ timeout: 15000 })
await page.waitForTimeout(800)

await page.screenshot({ path: `${OUT}/graphite-dashboard-1440x900.png` })
await page.screenshot({ path: `${OUT}/graphite-sync-indicator.png`, clip: { x: 900, y: 8, width: 520, height: 56 } })

await page.getByText('Ship quarterly roadmap review').click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/graphite-task-expanded.png` })

await page.keyboard.press('Meta+k')
await page.getByRole('dialog', { name: 'Command palette' }).waitFor()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/graphite-command-palette.png` })
await page.keyboard.press('Escape')

await page.keyboard.press('f')
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/graphite-focus-mode.png` })
await page.keyboard.press('Escape')

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/graphite-mobile-390x844.png` })

const vidCtx = await browser.newContext({
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
})
const vidPage = await vidCtx.newPage()
await vidPage.addInitScript(() => {
  localStorage.setItem('graphite-access-key', 'dev-local-key')
})
await vidPage.goto(BASE, { waitUntil: 'networkidle' })
await vidPage.getByText('Make things', { exact: false }).waitFor()
await vidPage.getByRole('button', { name: 'Mark complete' }).first().click()
await vidPage.waitForTimeout(1500)
const video = vidPage.video()
await vidCtx.close()
if (video) {
  const webm = await video.path()
  await rename(webm, `${OUT}/graphite-complete-task.webm`)
}

await browser.close()
console.log('Artifacts:', (await readdir(OUT)).join(', '))
