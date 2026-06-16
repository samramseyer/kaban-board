import { useRef, useState } from 'react'
import { COLUMNS, createEmptyTask, getSampleTasks } from './constants'
import { useBoard } from './hooks/useBoard'
import type { ColumnId, Task, TaskDraft } from './types'
import { exportBoard, importBoard } from './utils/storage'
import { Board } from './components/Board'
import { FilterBar, Header, getTotalStoryPoints } from './components/Header'
import { TaskModal } from './components/TaskModal'

export default function App() {
  const board = useBoard()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draft, setDraft] = useState<TaskDraft>(createEmptyTask())
  const [isNew, setIsNew] = useState(true)

  const openNewTask = (columnId: ColumnId = 'backlog') => {
    setEditingTask(null)
    setDraft(createEmptyTask(columnId))
    setIsNew(true)
    setModalOpen(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setDraft({
      title: task.title,
      description: task.description,
      columnId: task.columnId,
      priority: task.priority,
      labels: [...task.labels],
      assignee: task.assignee,
      storyPoints: task.storyPoints,
      dueDate: task.dueDate,
    })
    setIsNew(false)
    setModalOpen(true)
  }

  const handleSave = (form: TaskDraft) => {
    if (isNew) {
      board.addTask(form)
    } else if (editingTask) {
      board.updateTask(editingTask.id, form)
    }
  }

  const handleExport = () => {
    const json = exportBoard({ tasks: board.tasks, columns: COLUMNS, filters: board.filters })
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaban-board-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importBoard(reader.result as string)
        board.loadTasks(imported.tasks)
        if (imported.filters) {
          board.setFilters(imported.filters)
        }
      } catch {
        alert('Could not import file. Please use a valid Kaban Board JSON export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    if (confirm('Reset board to sample tasks? Your current data will be replaced.')) {
      board.loadTasks(getSampleTasks())
      board.setFilters({ search: '', priority: 'all', label: 'all', assignee: '' })
    }
  }

  return (
    <div className="app">
      <Header
        taskCount={board.tasks.length}
        filteredCount={board.filteredTasks.length}
        totalPoints={getTotalStoryPoints(board.filteredTasks)}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
      />

      <FilterBar
        filters={board.filters}
        onChange={board.setFilters}
        onClear={() => board.setFilters({ search: '', priority: 'all', label: 'all', assignee: '' })}
      />

      <p className="local-notice" aria-live="polite">
        All tasks and preferences are saved to this browser only. Nothing is sent to a server.
        Use Export to back up your board.
      </p>

      <main className="app__main">
        <Board board={board} onTaskClick={openEditTask} onAddTask={openNewTask} />
      </main>

      <button type="button" className="fab" onClick={() => openNewTask('backlog')} aria-label="Add new task">
        +
      </button>

      <TaskModal
        task={editingTask}
        draft={draft}
        isOpen={modalOpen}
        isNew={isNew}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={board.deleteTask}
      />

      <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleFileChange} />
    </div>
  )
}
