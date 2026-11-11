import { chromium } from 'playwright'
import { mkdir, readdir } from 'fs/promises'

const BASE = 'http://127.0.0.1:43123'
const OUT = '/opt/cursor/artifacts'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()

const waitHero = () => page.getByRole('heading', { name: /Make things/i }).waitFor({ timeout: 20000 })

await page.addInitScript(() => localStorage.clear())

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.getByText('Enter access key').waitFor({ timeout: 15000 })
await page.getByLabel('Access key').fill('dev-local-key')
await page.getByRole('button', { name: 'Continue' }).click()
await waitHero()

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
await waitHero()
await page.waitForTimeout(800)

await page.setViewportSize({ width: 1440, height: 900 })
await page.screenshot({ path: `${OUT}/graphite-dashboard-states-1440x900.png` })
await page.screenshot({ path: `${OUT}/graphite-my-files-1440x900.png`, clip: { x: 900, y: 120, width: 520, height: 420 } })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/graphite-mobile-390x844.png` })

await browser.close()
console.log(
  'Artifacts (My files mocked — no BLOB_READ_WRITE_TOKEN in VM):',
  (await readdir(OUT)).filter((f) => f.endsWith('graphite-') && f.endsWith('.png')).join(', '),
)
