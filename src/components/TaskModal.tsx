import { useEffect, useState } from 'react'
import { LABELS, PRIORITIES, TEAM_MEMBERS } from '../constants'
import type { ColumnId, Task, TaskDraft } from '../types'

interface TaskModalProps {
  task: Task | null
  draft: TaskDraft
  isOpen: boolean
  isNew: boolean
  onClose: () => void
  onSave: (draft: TaskDraft) => void
  onDelete?: (id: string) => void
}

export function TaskModal({ task, draft, isOpen, isNew, onClose, onSave, onDelete }: TaskModalProps) {
  const [form, setForm] = useState<TaskDraft>(draft)

  useEffect(() => {
    if (isOpen) setForm(draft)
  }, [isOpen, draft])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleLabel = (label: TaskDraft['labels'][number]) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim() })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className="modal__header">
          <h2 id="task-modal-title">{isNew ? 'New Task' : 'Edit Task'}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Acceptance criteria, notes, links..."
              rows={4}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Column</span>
              <select
                value={form.columnId}
                onChange={(e) => setForm((p) => ({ ...p, columnId: e.target.value as ColumnId }))}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Code Review</option>
                <option value="testing">QA / Testing</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priority: e.target.value as TaskDraft['priority'] }))
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Assignee</span>
              <select
                value={form.assignee}
                onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))}
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Story Points</span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.storyPoints ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    storyPoints: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="—"
              />
            </label>

            <label className="field">
              <span>Due Date</span>
              <input
                type="date"
                value={form.dueDate ?? ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value || null }))
                }
              />
            </label>
          </div>

          <fieldset className="field">
            <legend>Labels</legend>
            <div className="label-picker">
              {LABELS.map((label) => (
                <button
                  key={label.value}
                  type="button"
                  className={`label-chip ${form.labels.includes(label.value) ? 'label-chip--active' : ''}`}
                  style={
                    form.labels.includes(label.value)
                      ? { backgroundColor: `${label.color}33`, borderColor: label.color, color: label.color }
                      : undefined
                  }
                  onClick={() => toggleLabel(label.value)}
                >
                  {label.label}
                </button>
              ))}
            </div>
          </fieldset>

          <footer className="modal__footer">
            {!isNew && task && onDelete && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  if (confirm('Delete this task permanently?')) {
                    onDelete(task.id)
                    onClose()
                  }
                }}
              >
                Delete
              </button>
            )}
            <div className="modal__footer-right">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={!form.title.trim()}>
                {isNew ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}
