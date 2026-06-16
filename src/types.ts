export type ColumnId =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'testing'
  | 'done'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export type TaskLabel =
  | 'bug'
  | 'feature'
  | 'tech-debt'
  | 'documentation'
  | 'spike'

export interface Task {
  id: string
  title: string
  description: string
  columnId: ColumnId
  priority: Priority
  labels: TaskLabel[]
  assignee: string
  storyPoints: number | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: ColumnId
  title: string
  color: string
}

export interface BoardState {
  tasks: Task[]
  columns: Column[]
  filters?: FilterState
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export interface FilterState {
  search: string
  priority: Priority | 'all'
  label: TaskLabel | 'all'
  assignee: string
}
