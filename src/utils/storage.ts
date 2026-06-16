import { COLUMNS, getSampleTasks, STORAGE_KEY } from '../constants'
import type { BoardState, FilterState, Task } from '../types'
import { migrateTaskOrders } from './taskOrder'

export const defaultFilters: FilterState = {
  search: '',
  priority: 'all',
  label: 'all',
  assignee: '',
}

export const NOTICE_DISMISSED_KEY = 'kaban-board-notice-dismissed'

function normalizeBoard(parsed: BoardState): BoardState {
  return {
    tasks: migrateTaskOrders(parsed.tasks),
    columns: parsed.columns ?? COLUMNS,
    filters: parsed.filters ?? defaultFilters,
  }
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BoardState
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return normalizeBoard(parsed)
      }
    }
  } catch {
    // fall through to default
  }

  return normalizeBoard({
    tasks: getSampleTasks(),
    columns: COLUMNS,
    filters: defaultFilters,
  })
}

export function saveBoard(state: BoardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // QuotaExceededError or private browsing — silently fail; data stays in memory
  }
}

export function exportBoard(state: BoardState): string {
  return JSON.stringify(state, null, 2)
}

export function importBoard(json: string): BoardState {
  const parsed = JSON.parse(json) as BoardState
  if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
    throw new Error('Invalid board file: missing tasks array')
  }
  return normalizeBoard({
    tasks: parsed.tasks,
    columns: parsed.columns ?? COLUMNS,
    filters: parsed.filters ?? defaultFilters,
  })
}

export function getTotalStoryPoints(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)
}

export function isNoticeDismissed(): boolean {
  return localStorage.getItem(NOTICE_DISMISSED_KEY) === '1'
}

export function dismissNotice(): void {
  localStorage.setItem(NOTICE_DISMISSED_KEY, '1')
}
