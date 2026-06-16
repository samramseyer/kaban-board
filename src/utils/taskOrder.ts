import { COLUMNS } from '../constants'
import type { ColumnId, Task } from '../types'

export function migrateTaskOrders(tasks: Task[]): Task[] {
  const result = tasks.map((task) => ({ ...task, order: typeof task.order === 'number' ? task.order : 0 }))

  for (const column of COLUMNS) {
    const columnTasks = result
      .filter((t) => t.columnId === column.id)
      .sort((a, b) => a.order - b.order)

    columnTasks.forEach((task, index) => {
      const idx = result.findIndex((t) => t.id === task.id)
      result[idx] = { ...result[idx], order: index }
    })
  }

  return result
}

export function getNextOrder(tasks: Task[], columnId: ColumnId): number {
  const columnTasks = tasks.filter((t) => t.columnId === columnId)
  if (columnTasks.length === 0) return 0
  return Math.max(...columnTasks.map((t) => t.order)) + 1
}

export function sortTasksInColumn(tasks: Task[], columnId: ColumnId): Task[] {
  return tasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.order - b.order)
}

export function moveTaskInBoard(
  tasks: Task[],
  taskId: string,
  targetColumnId: ColumnId,
  insertBeforeId?: string,
): Task[] {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return tasks

  const now = new Date().toISOString()
  const without = tasks.filter((t) => t.id !== taskId)
  const columnTasks = sortTasksInColumn(without, targetColumnId)
  const updatedTask: Task = { ...task, columnId: targetColumnId, updatedAt: now }

  let insertIndex = columnTasks.length
  if (insertBeforeId) {
    const beforeIndex = columnTasks.findIndex((t) => t.id === insertBeforeId)
    if (beforeIndex !== -1) insertIndex = beforeIndex
  }

  columnTasks.splice(insertIndex, 0, updatedTask)
  const reindexed = columnTasks.map((t, index) => ({ ...t, order: index, updatedAt: t.id === taskId ? now : t.updatedAt }))

  const otherTasks = without.filter((t) => t.columnId !== targetColumnId)
  return [...otherTasks, ...reindexed]
}

export function reorderTasksInColumn(tasks: Task[], columnId: ColumnId, activeId: string, overId: string): Task[] {
  const columnTasks = sortTasksInColumn(tasks, columnId)
  const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
  const newIndex = columnTasks.findIndex((t) => t.id === overId)
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return tasks

  const reordered = [...columnTasks]
  const [removed] = reordered.splice(oldIndex, 1)
  reordered.splice(newIndex, 0, removed)

  const now = new Date().toISOString()
  const reindexed = reordered.map((t, index) => ({
    ...t,
    order: index,
    updatedAt: t.id === activeId ? now : t.updatedAt,
  }))

  const otherTasks = tasks.filter((t) => t.columnId !== columnId)
  return [...otherTasks, ...reindexed]
}

export function countHiddenInColumn(allTasks: Task[], visibleTasks: Task[], columnId: ColumnId): number {
  const total = allTasks.filter((t) => t.columnId === columnId).length
  const visible = visibleTasks.filter((t) => t.columnId === columnId).length
  return total - visible
}
