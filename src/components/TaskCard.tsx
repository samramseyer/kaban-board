import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { TaskCardContent } from './TaskCardContent'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <article className="task-card task-card--overlay">
      <div className="task-card__inner">
        <span className="task-card__handle task-card__handle--static" aria-hidden="true">
          ⠿
        </span>
        <div className="task-card__body task-card__body--static">
          <TaskCardContent task={task} />
        </div>
      </div>
    </article>
  )
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      {...attributes}
    >
      <div className="task-card__inner">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="task-card__handle"
          aria-label={`Drag task: ${task.title}`}
          {...listeners}
        >
          ⠿
        </button>
        <button type="button" className="task-card__body" onClick={() => onClick(task)}>
          <TaskCardContent task={task} showUpdated />
        </button>
      </div>
    </article>
  )
}
