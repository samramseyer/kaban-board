import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { COLUMNS, createEmptyTask } from '../constants'
import type { ColumnId, FilterState, Task, TaskDraft } from '../types'
import { defaultFilters, loadBoard, saveBoard } from '../utils/storage'

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

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>(() => loadBoard().tasks)
  const [filters, setFilters] = useState<FilterState>(() => loadBoard().filters ?? defaultFilters)

  useEffect(() => {
    saveBoard({ tasks, columns: COLUMNS, filters })
  }, [tasks, filters])

  const filteredTasks = useMemo(
    () => tasks.filter((t) => matchesFilter(t, filters)),
    [tasks, filters],
  )

  const tasksByColumn = useMemo(() => {
    const map = new Map<ColumnId, Task[]>()
    for (const col of COLUMNS) {
      map.set(col.id, filteredTasks.filter((t) => t.columnId === col.id))
    }
    return map
  }, [filteredTasks])

  const addTask = useCallback((draft: TaskDraft) => {
    const now = new Date().toISOString()
    const task: Task = {
      ...draft,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    setTasks((prev) => [...prev, task])
    return task
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<TaskDraft>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
      ),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const moveTask = useCallback((taskId: string, columnId: ColumnId, index?: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      if (!task) return prev

      const without = prev.filter((t) => t.id !== taskId)
      const updated: Task = {
        ...task,
        columnId,
        updatedAt: new Date().toISOString(),
      }

      if (index === undefined) {
        return [...without, updated]
      }

      const columnTasks = without.filter((t) => t.columnId === columnId)
      const otherTasks = without.filter((t) => t.columnId !== columnId)
      columnTasks.splice(index, 0, updated)
      return [...otherTasks, ...columnTasks]
    })
  }, [])

  const reorderInColumn = useCallback((columnId: ColumnId, activeId: string, overId: string) => {
    setTasks((prev) => {
      const columnTasks = prev.filter((t) => t.columnId === columnId)
      const otherTasks = prev.filter((t) => t.columnId !== columnId)

      const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
      const newIndex = columnTasks.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev

      const reordered = [...columnTasks]
      const [removed] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, removed)

      return [...otherTasks, ...reordered]
    })
  }, [])

  const resetBoard = useCallback(() => {
    setTasks(loadBoard().tasks)
    setFilters(defaultFilters)
  }, [])

  const clearBoard = useCallback(() => {
    setTasks([])
    setFilters(defaultFilters)
  }, [])

  const loadTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks)
  }, [])

  return {
    tasks,
    filteredTasks,
    tasksByColumn,
    columns: COLUMNS,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderInColumn,
    resetBoard,
    clearBoard,
    loadTasks,
    createEmptyTask,
  }
}

export type BoardActions = ReturnType<typeof useBoard>
