import { useEffect, useRef, useState } from 'react'
import { COLUMNS, LABELS, PRIORITIES, TEAM_MEMBERS } from '../constants'
import type { ColumnId, Task, TaskDraft } from '../types'
import { formatRelativeTime } from '../utils/format'

interface TaskModalProps {
  task: Task | null
  draft: TaskDraft
  isOpen: boolean
  isNew: boolean
  onClose: () => void
  onSave: (draft: TaskDraft) => void
  onDelete?: () => void
}

export function TaskModal({ task, draft, isOpen, isNew, onClose, onSave, onDelete }: TaskModalProps) {
  const [form, setForm] = useState<TaskDraft>(draft)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setForm(draft)
  }, [isOpen, draft])

  useEffect(() => {
    if (!isOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable?.[0]
    const last = focusable?.[focusable.length - 1]

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable?.length) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', trapFocus)
    document.body.style.overflow = 'hidden'
    first?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', trapFocus)
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
        ref={modalRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className="modal__header">
          <div>
            <h2 id="task-modal-title">{isNew ? 'New Task' : 'Edit Task'}</h2>
            {!isNew && task && (
              <p className="modal__meta">
                Updated {formatRelativeTime(task.updatedAt)} · Created{' '}
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
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
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
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
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value || null }))}
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
            {!isNew && onDelete && (
              <button type="button" className="btn btn--danger" onClick={onDelete}>
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
