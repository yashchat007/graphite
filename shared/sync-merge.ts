import type { SyncDocument, SyncFile, SyncList, SyncTask, Tombstone } from './sync-types'

function maxIso(a: string, b: string): string {
  return a >= b ? a : b
}

function tombstoneMap(tombstones: Tombstone[]): Map<string, Tombstone> {
  const map = new Map<string, Tombstone>()
  for (const t of tombstones) {
    const key = `${t.kind}:${t.id}`
    const prev = map.get(key)
    if (!prev || t.deletedAt > prev.deletedAt) map.set(key, t)
  }
  return map
}

function mergeTombstones(a: Tombstone[], b: Tombstone[]): Tombstone[] {
  return [...tombstoneMap([...a, ...b]).values()].sort((x, y) => x.deletedAt.localeCompare(y.deletedAt))
}

function taskDeleted(ts: Map<string, Tombstone>, task: SyncTask): boolean {
  const stone = ts.get(`task:${task.id}`)
  return Boolean(stone && stone.deletedAt >= task.updatedAt)
}

function listDeleted(ts: Map<string, Tombstone>, list: SyncList): boolean {
  const stone = ts.get(`list:${list.id}`)
  return Boolean(stone && stone.deletedAt >= list.updatedAt)
}

function mergeTasks(a: SyncTask[], b: SyncTask[], ts: Map<string, Tombstone>): SyncTask[] {
  const map = new Map<string, SyncTask>()
  for (const t of [...a, ...b]) {
    const prev = map.get(t.id)
    if (!prev || t.updatedAt >= prev.updatedAt) map.set(t.id, t)
  }
  return [...map.values()]
    .filter((t) => !taskDeleted(ts, t))
    .sort((x, y) => x.order - y.order)
}

function fileDeleted(ts: Map<string, Tombstone>, file: SyncFile): boolean {
  const stone = ts.get(`file:${file.id}`)
  return Boolean(stone && stone.deletedAt >= file.updatedAt)
}

function mergeFiles(a: SyncFile[], b: SyncFile[], ts: Map<string, Tombstone>): SyncFile[] {
  const map = new Map<string, SyncFile>()
  for (const f of [...a, ...b]) {
    const prev = map.get(f.id)
    if (!prev || f.updatedAt >= prev.updatedAt) map.set(f.id, f)
  }
  return [...map.values()]
    .filter((f) => !fileDeleted(ts, f))
    .sort((x, y) => y.uploadedAt.localeCompare(x.uploadedAt))
}

function mergeLists(a: SyncList[], b: SyncList[], ts: Map<string, Tombstone>): SyncList[] {
  const map = new Map<string, SyncList>()
  for (const l of [...a, ...b]) {
    const prev = map.get(l.id)
    if (!prev || l.updatedAt >= prev.updatedAt) map.set(l.id, l)
  }
  return [...map.values()].filter((l) => !listDeleted(ts, l))
}

/** Last-write-wins per entity; tombstones beat older task/list revisions. */
export function mergeDocuments(left: SyncDocument, right: SyncDocument): SyncDocument {
  const tombstones = mergeTombstones(left.tombstones, right.tombstones)
  const ts = tombstoneMap(tombstones)
  const tasks = mergeTasks(left.tasks, right.tasks, ts)
  const lists = mergeLists(left.lists, right.lists, ts)
  const files = mergeFiles(left.files ?? [], right.files ?? [], ts)
  const todayNoteUpdatedAt = maxIso(left.todayNoteUpdatedAt, right.todayNoteUpdatedAt)
  const todayNote =
    todayNoteUpdatedAt === left.todayNoteUpdatedAt ? left.todayNote : right.todayNote

  return {
    tasks,
    lists,
    files,
    todayNote,
    todayNoteUpdatedAt,
    tombstones,
  }
}

export function documentFromClient(input: Partial<SyncDocument> | null | undefined): SyncDocument {
  if (!input) return { ...EMPTY_SYNC_DOC_PLACEHOLDER() }
  return {
    tasks: input.tasks ?? [],
    lists: input.lists ?? [],
    files: input.files ?? [],
    todayNote: input.todayNote ?? '',
    todayNoteUpdatedAt: input.todayNoteUpdatedAt ?? new Date(0).toISOString(),
    tombstones: input.tombstones ?? [],
  }
}

function EMPTY_SYNC_DOC_PLACEHOLDER(): SyncDocument {
  return {
    tasks: [],
    lists: [],
    files: [],
    todayNote: '',
    todayNoteUpdatedAt: new Date(0).toISOString(),
    tombstones: [],
  }
}
