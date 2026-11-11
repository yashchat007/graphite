import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { readdir } from 'fs/promises'

const BASE = 'http://127.0.0.1:43123'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

await page.addInitScript(() => localStorage.clear())

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.getByText('Enter access key').waitFor({ timeout: 15000 })
await page.getByLabel('Access key').fill('dev-local-key')
await page.getByRole('button', { name: 'Continue' }).click()
await page.getByText('Make things', { exact: false }).waitFor({ timeout: 15000 })

await page.evaluate(() => {
  const key = 'graphite-store-v1'
  const raw = localStorage.getItem(key)
  if (!raw) return
  const parsed = JSON.parse(raw)
  parsed.state.filterStatus = 'all'
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
})

await page.reload({ waitUntil: 'networkidle' })
await page.getByText('Make things', { exact: false }).waitFor({ timeout: 15000 })
await page.waitForTimeout(800)

await page.setViewportSize({ width: 1440, height: 900 })
await page.screenshot({ path: `${OUT}/graphite-dashboard-states-1440x900.png`, fullPage: false })

await page.screenshot({ path: `${OUT}/graphite-my-files-1440x900.png`, clip: { x: 900, y: 120, width: 520, height: 420 } })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/graphite-mobile-390x844.png` })

await browser.close()
console.log('Artifacts (mock files — Blob not configured in VM):', (await readdir(OUT)).filter((f) => f.endsWith('.png')).join(', '))
