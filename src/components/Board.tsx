import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { BoardActions } from '../hooks/useBoard'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { ColumnId, Task } from '../types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCardPreview } from './TaskCard'

interface BoardProps {
  board: BoardActions
  onTaskClick: (task: Task) => void
  onAddTask: (columnId: ColumnId) => void
  onActiveColumnChange?: (columnId: ColumnId) => void
}

export function Board({ board, onTaskClick, onAddTask, onActiveColumnChange }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<ColumnId>(board.columns[0]?.id ?? 'backlog')
  const boardRef = useRef<HTMLDivElement>(null)
  const isCompact = useMediaQuery('(max-width: 1024px)')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const setActiveColumn = useCallback(
    (columnId: ColumnId) => {
      setActiveColumnId(columnId)
      onActiveColumnChange?.(columnId)
    },
    [onActiveColumnChange],
  )

  const scrollToColumn = useCallback(
    (columnId: ColumnId) => {
      const column = boardRef.current?.querySelector(`[data-column-id="${columnId}"]`)
      column?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
      setActiveColumn(columnId)
    },
    [setActiveColumn],
  )

  useEffect(() => {
    onActiveColumnChange?.(board.columns[0]?.id ?? 'backlog')
  }, [onActiveColumnChange, board.columns])

  useEffect(() => {
    if (!isCompact || !boardRef.current) return

    const container = boardRef.current
    const columns = container.querySelectorAll<HTMLElement>('[data-column-id]')

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target instanceof HTMLElement) {
          const id = visible.target.dataset.columnId as ColumnId | undefined
          if (id) setActiveColumn(id)
        }
      },
      { root: container, threshold: [0.35, 0.55, 0.75] },
    )

    columns.forEach((col) => observer.observe(col))
    return () => observer.disconnect()
  }, [isCompact, board.columns.length, setActiveColumn])

  const handleDragStart = (event: DragStartEvent) => {
    const task = board.tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const task = board.tasks.find((t) => t.id === activeId)
    if (!task) return

    let overColumnId: ColumnId | null = null
    let insertBeforeId: string | undefined

    if (over.data.current?.type === 'column') {
      overColumnId = over.data.current.columnId as ColumnId
    } else if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task as Task
      overColumnId = overTask.columnId
      insertBeforeId = overTask.id
    } else {
      const col = board.columns.find((c) => c.id === over.id)
      if (col) overColumnId = col.id
    }

    if (overColumnId && task.columnId !== overColumnId) {
      board.moveTask(activeId, overColumnId, insertBeforeId)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const activeTaskItem = board.tasks.find((t) => t.id === activeId)
    if (!activeTaskItem) return

    if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task as Task
      if (activeTaskItem.columnId === overTask.columnId) {
        board.reorderInColumn(activeTaskItem.columnId, activeId, overId)
      } else {
        board.moveTask(activeId, overTask.columnId, overTask.id)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board-shell">
        {isCompact && (
          <nav className="board-nav" aria-label="Board columns">
            {board.columns.map((column) => {
              const count = (board.tasksByColumn.get(column.id) ?? []).length
              const hidden = board.hiddenByColumn.get(column.id) ?? 0
              return (
                <button
                  key={column.id}
                  type="button"
                  className={`board-nav__pill ${activeColumnId === column.id ? 'board-nav__pill--active' : ''}`}
                  style={
                    activeColumnId === column.id
                      ? { borderColor: column.color, color: column.color }
                      : undefined
                  }
                  onClick={() => scrollToColumn(column.id)}
                >
                  <span className="board-nav__dot" style={{ backgroundColor: column.color }} />
                  <span className="board-nav__label">{column.title}</span>
                  <span className="board-nav__count">{count}{hidden > 0 ? `+${hidden}` : ''}</span>
                </button>
              )
            })}
          </nav>
        )}

        <div className="board" ref={boardRef}>
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={board.tasksByColumn.get(column.id) ?? []}
              hiddenCount={board.hiddenByColumn.get(column.id) ?? 0}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeTask ? <TaskCardPreview task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
