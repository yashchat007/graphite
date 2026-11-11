import { chromium } from 'playwright'
import { mkdir, readdir } from 'fs/promises'

const BASE = 'http://127.0.0.1:43123'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()

const waitHero = () => page.getByRole('heading', { name: /Make things/i }).waitFor({ timeout: 20000 })

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('Enter access key').waitFor({ timeout: 15000 })
await page.getByLabel('Access key').fill('dev-local-key')
await page.getByRole('button', { name: 'Continue' }).click()
await waitHero()

await page.evaluate(() => {
  const key = 'graphite-store-v1'
  const raw = localStorage.getItem(key)
  if (!raw) return
  const parsed = JSON.parse(raw)
  const ago3d = new Date(Date.now() - 3 * 86400000).toISOString()
  const ago1d = new Date(Date.now() - 86400000).toISOString()
  parsed.state.files = [
    {
      id: 'mock-1',
      name: 'Q1_Briefing.pdf',
      size: 2457600,
      contentType: 'application/pdf',
      pathname: 'mock/q1-briefing.pdf',
      uploadedAt: ago3d,
      updatedAt: ago3d,
    },
    {
      id: 'mock-2',
      name: 'Sprint_notes.md',
      size: 18432,
      contentType: 'text/markdown',
      pathname: 'mock/sprint-notes.md',
      uploadedAt: ago1d,
      updatedAt: ago1d,
    },
  ]
  localStorage.setItem(key, JSON.stringify(parsed))
  localStorage.setItem('graphite-access-key', 'dev-local-key')
})

await page.reload({ waitUntil: 'networkidle' })
await waitHero()
await page.waitForTimeout(600)

await page.setViewportSize({ width: 1440, height: 900 })
await page.screenshot({ path: `${OUT}/graphite-dashboard-completed-1440x900.png`, fullPage: true })

await page.screenshot({
  path: `${OUT}/graphite-sidebar-focus-1440x900.png`,
  clip: { x: 0, y: 0, width: 280, height: 900 },
})

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/graphite-mobile-390x844.png`, fullPage: true })

await browser.close()
console.log('Artifacts:', (await readdir(OUT)).filter((f) => f.startsWith('graphite-') && f.endsWith('.png')).join(', '))
