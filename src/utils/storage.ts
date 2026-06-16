import { COLUMNS, getSampleTasks, STORAGE_KEY } from '../constants'
import type { BoardState, FilterState, Task } from '../types'

export const defaultFilters: FilterState = {
  search: '',
  priority: 'all',
  label: 'all',
  assignee: '',
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BoardState
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return {
          tasks: parsed.tasks,
          columns: parsed.columns ?? COLUMNS,
          filters: parsed.filters ?? defaultFilters,
        }
      }
    }
  } catch {
    // fall through to default
  }

  return {
    tasks: getSampleTasks(),
    columns: COLUMNS,
    filters: defaultFilters,
  }
}

export function saveBoard(state: BoardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportBoard(state: BoardState): string {
  return JSON.stringify(state, null, 2)
}

export function importBoard(json: string): BoardState {
  const parsed = JSON.parse(json) as BoardState
  if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
    throw new Error('Invalid board file: missing tasks array')
  }
  return {
    tasks: parsed.tasks,
    columns: parsed.columns ?? COLUMNS,
    filters: parsed.filters ?? defaultFilters,
  }
}

export function getColumnTaskCount(tasks: Task[], columnId: string): number {
  return tasks.filter((t) => t.columnId === columnId).length
}

export function getTotalStoryPoints(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)
}
