import type { Column, ColumnId, Priority, Task, TaskDraft, TaskLabel } from './types'

export const STORAGE_KEY = 'kaban-board-v1'

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#64748b' },
  { id: 'todo', title: 'To Do', color: '#6366f1' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'Code Review', color: '#8b5cf6' },
  { id: 'testing', title: 'QA / Testing', color: '#06b6d4' },
  { id: 'done', title: 'Done', color: '#22c55e' },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export const LABELS: { value: TaskLabel; label: string; color: string }[] = [
  { value: 'bug', label: 'Bug', color: '#ef4444' },
  { value: 'feature', label: 'Feature', color: '#3b82f6' },
  { value: 'tech-debt', label: 'Tech Debt', color: '#a855f7' },
  { value: 'documentation', label: 'Docs', color: '#14b8a6' },
  { value: 'spike', label: 'Spike', color: '#f97316' },
]

export const TEAM_MEMBERS = [
  'Alex Chen',
  'Jordan Lee',
  'Sam Rivera',
  'Taylor Kim',
  'Unassigned',
]

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#94a3b8',
}

export const DEFAULT_COLUMN: ColumnId = 'backlog'

export function createEmptyTask(columnId: ColumnId = DEFAULT_COLUMN): TaskDraft {
  return {
    title: '',
    description: '',
    columnId,
    priority: 'medium',
    labels: [],
    assignee: 'Unassigned',
    storyPoints: null,
    dueDate: null,
  }
}

export function getSampleTasks(): Task[] {
  const now = new Date().toISOString()
  const samples: Omit<Task, 'order'>[] = [
    {
      id: 'sample-1',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for lint, test, and deploy on merge to main.',
      columnId: 'backlog',
      priority: 'high',
      labels: ['feature'],
      assignee: 'Alex Chen',
      storyPoints: 5,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-2',
      title: 'Fix login redirect loop',
      description: 'Users with expired sessions get stuck in an infinite redirect on /dashboard.',
      columnId: 'todo',
      priority: 'critical',
      labels: ['bug'],
      assignee: 'Jordan Lee',
      storyPoints: 3,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-3',
      title: 'Implement drag-and-drop board',
      description: 'Use @dnd-kit for accessible column and card reordering.',
      columnId: 'in-progress',
      priority: 'high',
      labels: ['feature'],
      assignee: 'Sam Rivera',
      storyPoints: 8,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-4',
      title: 'Refactor auth middleware',
      description: 'Extract token validation into shared utility to reduce duplication.',
      columnId: 'review',
      priority: 'medium',
      labels: ['tech-debt'],
      assignee: 'Taylor Kim',
      storyPoints: 2,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-5',
      title: 'Write API documentation',
      description: 'Document all REST endpoints with request/response examples.',
      columnId: 'testing',
      priority: 'low',
      labels: ['documentation'],
      assignee: 'Alex Chen',
      storyPoints: 3,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-6',
      title: 'Add dark mode toggle',
      description: 'Persist theme preference in localStorage.',
      columnId: 'done',
      priority: 'medium',
      labels: ['feature'],
      assignee: 'Jordan Lee',
      storyPoints: 2,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const withOrder: Task[] = []
  for (const column of COLUMNS) {
    const columnSamples = samples.filter((s) => s.columnId === column.id)
    columnSamples.forEach((sample, index) => {
      withOrder.push({ ...sample, order: index })
    })
  }
  return withOrder
}
