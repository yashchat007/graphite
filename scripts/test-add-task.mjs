/**
 * Manual regression: quick-add and modal create tasks visible on Today (IST due date default).
 */
import assert from 'node:assert'
import { chromium } from 'playwright'

const BASE = process.env.PREVIEW_URL ?? 'http://127.0.0.1:43123'

const legacyV1 = {
  state: {
    version: 0,
    seeded: true,
    tasks: [
      {
        id: 'legacy-1',
        title: 'Legacy tagged task',
        description: '',
        dueDate: new Date().toISOString().slice(0, 10),
        priority: 'none',
        listId: 'work',
        completed: false,
        starred: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['old-tag'],
        subtasks: [{ id: 's1', title: 'Sub', completed: false }],
      },
    ],
    lists: [
      { id: 'work', name: 'Work', updatedAt: new Date().toISOString() },
      { id: 'personal', name: 'Personal', updatedAt: new Date().toISOString() },
    ],
    todayNote: 'Legacy note',
    todayNoteUpdatedAt: new Date().toISOString(),
    tombstones: [],
    files: [],
    sidebarCollapsed: false,
  },
  version: 0,
}

const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate((v1) => {
  localStorage.setItem('graphite-store-v1', JSON.stringify(v1))
  localStorage.setItem('graphite-store-v2', JSON.stringify({
    state: {
      ...v1.state,
      tasks: v1.state.tasks.map((t) => {
        const { tags, subtasks, ...rest } = t
        return rest
      }),
    },
    version: 0,
  }))
  localStorage.setItem('graphite-access-key', 'dev-local-key')
}, legacyV1)
await page.reload({ waitUntil: 'networkidle' })

const enterKey = page.getByLabel('Access key')
if (await enterKey.isVisible().catch(() => false)) {
  await enterKey.fill('dev-local-key')
  await page.getByRole('button', { name: 'Continue' }).click()
}

await page.getByRole('heading', { name: /Make things/i }).waitFor({ timeout: 15000 })

const taskCountBefore = await page.evaluate(() => {
  const raw = localStorage.getItem('graphite-store-v2')
  const parsed = JSON.parse(raw)
  return parsed.state.tasks.length
})

await page.getByLabel('Quick add task').fill('Playwright quick add test')
await page.getByRole('button', { name: 'Add' }).click()
await page.waitForTimeout(300)

const visibleQuick = await page.getByText('Playwright quick add test').count()
assert.ok(visibleQuick >= 1, 'quick-added task should appear in Today list')

const taskCountAfterQuick = await page.evaluate(() => {
  const raw = localStorage.getItem('graphite-store-v2')
  return JSON.parse(raw).state.tasks.length
})
assert.ok(taskCountAfterQuick > taskCountBefore, 'store should gain a task from quick add')

await page.getByRole('button', { name: 'New task' }).click()
await page.getByRole('dialog').getByLabel('Title').fill('Modal created task')
await page.getByRole('button', { name: 'Save' }).click()
await page.waitForTimeout(300)

const visibleModal = await page.getByText('Modal created task').count()
assert.ok(visibleModal >= 1, 'modal-created task should appear in list')

await browser.close()
console.log('add-task tests passed')
