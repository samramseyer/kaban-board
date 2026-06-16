import { useCallback, useMemo, useRef, useState } from 'react'
import { COLUMNS, createEmptyTask, getSampleTasks } from '../constants'
import type { ColumnId, FilterState, Task, TaskDraft } from '../types'
import { createId } from '../utils/format'
import { defaultFilters, loadBoard, saveBoard } from '../utils/storage'
import {
  countHiddenInColumn,
  getNextOrder,
  moveTaskInBoard,
  reorderTasksInColumn,
  sortTasksInColumn,
} from '../utils/taskOrder'
import { useDebouncedSave } from './useDebouncedSave'

function matchesFilter(task: Task, filters: FilterState): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase()
    const haystack = `${task.title} ${task.description} ${task.assignee}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (filters.priority !== 'all' && task.priority !== filters.priority) return false
  if (filters.label !== 'all' && !task.labels.includes(filters.label)) return false
  if (filters.assignee && task.assignee !== filters.assignee) return false
  return true
}

const initialBoard = loadBoard()

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialBoard.tasks)
  const [filters, setFilters] = useState<FilterState>(initialBoard.filters ?? defaultFilters)
  const undoRef = useRef<{ task: Task; timer: number } | null>(null)

  const boardState = useMemo(() => ({ tasks, columns: COLUMNS, filters }), [tasks, filters])

  useDebouncedSave(boardState, saveBoard)

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.search || filters.priority !== 'all' || filters.label !== 'all' || filters.assignee),
    [filters],
  )

  const filteredTasks = useMemo(
    () => tasks.filter((t) => matchesFilter(t, filters)),
    [tasks, filters],
  )

  const tasksByColumn = useMemo(() => {
    const map = new Map<ColumnId, Task[]>()
    for (const col of COLUMNS) {
      map.set(col.id, sortTasksInColumn(filteredTasks, col.id))
    }
    return map
  }, [filteredTasks])

  const hiddenByColumn = useMemo(() => {
    const map = new Map<ColumnId, number>()
    for (const col of COLUMNS) {
      map.set(col.id, countHiddenInColumn(tasks, filteredTasks, col.id))
    }
    return map
  }, [tasks, filteredTasks])

  const addTask = useCallback((draft: TaskDraft) => {
    const now = new Date().toISOString()
    setTasks((prev) => {
      const task: Task = {
        ...draft,
        id: createId(),
        order: getNextOrder(prev, draft.columnId),
        createdAt: now,
        updatedAt: now,
      }
      return [...prev, task]
    })
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<TaskDraft>) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (!task) return prev

      const now = new Date().toISOString()
      const merged: Task = { ...task, ...updates, updatedAt: now }

      if (updates.columnId && updates.columnId !== task.columnId) {
        const without = prev.filter((t) => t.id !== id)
        return moveTaskInBoard([...without, merged], id, updates.columnId)
      }

      return prev.map((t) => (t.id === id ? merged : t))
    })
  }, [])

  const deleteTask = useCallback((id: string, onUndo?: (task: Task) => void) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (!task) return prev

      if (undoRef.current) window.clearTimeout(undoRef.current.timer)
      if (onUndo) {
        const timer = window.setTimeout(() => {
          undoRef.current = null
        }, 5000)
        undoRef.current = { task, timer }
        onUndo(task)
      }

      return prev.filter((t) => t.id !== id)
    })
  }, [])

  const restoreTask = useCallback((task: Task) => {
    if (undoRef.current) window.clearTimeout(undoRef.current.timer)
    undoRef.current = null
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev
      return [...prev, task]
    })
  }, [])

  const moveTask = useCallback((taskId: string, columnId: ColumnId, insertBeforeId?: string) => {
    setTasks((prev) => moveTaskInBoard(prev, taskId, columnId, insertBeforeId))
  }, [])

  const reorderInColumn = useCallback((columnId: ColumnId, activeId: string, overId: string) => {
    setTasks((prev) => reorderTasksInColumn(prev, columnId, activeId, overId))
  }, [])

  const loadBoardState = useCallback((newTasks: Task[], newFilters?: FilterState) => {
    setTasks(newTasks)
    if (newFilters) setFilters(newFilters)
  }, [])

  const resetToSample = useCallback(() => {
    setTasks(getSampleTasks())
    setFilters(defaultFilters)
  }, [])

  return {
    tasks,
    filteredTasks,
    tasksByColumn,
    hiddenByColumn,
    hasActiveFilters,
    columns: COLUMNS,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    moveTask,
    reorderInColumn,
    loadBoardState,
    resetToSample,
    createEmptyTask,
  }
}

export type BoardActions = ReturnType<typeof useBoard>
