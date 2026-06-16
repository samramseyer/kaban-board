import { LABELS, PRIORITY_COLORS } from '../constants'
import type { Task } from '../types'
import { formatRelativeTime } from '../utils/format'

function formatDueDate(date: string | null): { text: string; overdue: boolean } | null {
  if (!date) return null
  const due = new Date(date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  const overdue = diff < 0
  const text =
    diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow' : diff < 0 ? `${Math.abs(diff)}d overdue` : `${diff}d left`
  return { text, overdue }
}

interface TaskCardContentProps {
  task: Task
  showUpdated?: boolean
}

export function TaskCardContent({ task, showUpdated = false }: TaskCardContentProps) {
  const due = formatDueDate(task.dueDate)
  const labelMap = Object.fromEntries(LABELS.map((l) => [l.value, l]))

  return (
    <>
      <div className="task-card__labels">
        {task.labels.map((label) => {
          const meta = labelMap[label]
          return (
            <span
              key={label}
              className="task-card__label"
              style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
            >
              {meta.label}
            </span>
          )
        })}
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && <p className="task-card__desc">{task.description}</p>}

      <footer className="task-card__footer">
        <span
          className="task-card__priority"
          style={{ color: PRIORITY_COLORS[task.priority] }}
          title={`${task.priority} priority`}
        >
          ● {task.priority}
        </span>

        <div className="task-card__meta">
          {task.storyPoints != null && (
            <span className="task-card__points" title="Story points">
              {task.storyPoints} SP
            </span>
          )}
          {due && (
            <span className={`task-card__due ${due.overdue ? 'task-card__due--overdue' : ''}`}>{due.text}</span>
          )}
          {showUpdated && (
            <span className="task-card__updated" title={new Date(task.updatedAt).toLocaleString()}>
              {formatRelativeTime(task.updatedAt)}
            </span>
          )}
          <span className="task-card__assignee" title={task.assignee}>
            {task.assignee === 'Unassigned' ? '?' : task.assignee.split(' ').map((n) => n[0]).join('')}
          </span>
        </div>
      </footer>
    </>
  )
}
