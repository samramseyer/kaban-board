import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType, Task } from '../types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  column: ColumnType
  tasks: Task[]
  hiddenCount: number
  onTaskClick: (task: Task) => void
  onAddTask: (columnId: ColumnType['id']) => void
}

export function KanbanColumn({ column, tasks, hiddenCount, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  })

  const taskIds = tasks.map((t) => t.id)
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)

  return (
    <section className={`column ${isOver ? 'column--over' : ''}`} data-column-id={column.id}>
      <header className="column__header" style={{ borderTopColor: column.color }}>
        <div className="column__title-row">
          <span className="column__dot" style={{ backgroundColor: column.color }} />
          <h2 className="column__title">{column.title}</h2>
          <span className="column__count">{tasks.length}</span>
        </div>
        <div className="column__header-meta">
          {hiddenCount > 0 && (
            <span className="column__hidden" title="Hidden by active filters">
              +{hiddenCount} hidden
            </span>
          )}
          {totalPoints > 0 && <span className="column__points">{totalPoints} SP</span>}
        </div>
      </header>

      <div ref={setNodeRef} className="column__body">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <p className="column__empty">
            {hiddenCount > 0 ? `${hiddenCount} task(s) hidden by filters` : 'Drop tasks here or add a new one'}
          </p>
        )}
      </div>

      <button type="button" className="column__add" onClick={() => onAddTask(column.id)}>
        + Add task
      </button>
    </section>
  )
}
