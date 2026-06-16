import { useEffect, useRef, useState } from 'react'
import { COLUMNS, createEmptyTask } from './constants'
import { useBoard } from './hooks/useBoard'
import { useConfirm } from './hooks/useConfirm'
import type { ColumnId, Task, TaskDraft } from './types'
import { dismissNotice, exportBoard, importBoard, isNoticeDismissed } from './utils/storage'
import { Board } from './components/Board'
import { ConfirmDialog, ToastStack } from './components/ConfirmDialog'
import { FilterBar, Header, getTotalStoryPoints } from './components/Header'
import { TaskModal } from './components/TaskModal'

export default function App() {
  const board = useBoard()
  const { confirmState, confirm, dismissConfirm, toasts, showToast, dismissToast } = useConfirm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draft, setDraft] = useState<TaskDraft>(createEmptyTask())
  const [isNew, setIsNew] = useState(true)
  const [activeColumnId, setActiveColumnId] = useState<ColumnId>('backlog')
  const [noticeDismissed, setNoticeDismissed] = useState(isNoticeDismissed)
  const [pendingImport, setPendingImport] = useState<{ tasks: Task[]; filters?: typeof board.filters } | null>(
    null,
  )

  const openNewTask = (columnId: ColumnId = activeColumnId) => {
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
      showToast('Task created')
    } else if (editingTask) {
      board.updateTask(editingTask.id, form)
      showToast('Task updated')
    }
  }

  const handleDelete = async () => {
    if (!editingTask) return
    const task = editingTask
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be removed from your board.`,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return

    board.deleteTask(task.id, (deleted) => {
      showToast('Task deleted', {
        label: 'Undo',
        onClick: () => {
          board.restoreTask(deleted)
          showToast('Task restored')
        },
      })
    })
    setModalOpen(false)
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
    showToast('Board exported')
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
        setPendingImport({ tasks: imported.tasks, filters: imported.filters })
      } catch {
        showToast('Invalid board file — please use a Kaban Board export')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  useEffect(() => {
    if (!pendingImport) return

    const run = async () => {
      const ok = await confirm({
        title: 'Import board?',
        message: `This will replace your ${board.tasks.length} current task(s) with ${pendingImport.tasks.length} imported task(s).`,
        confirmLabel: 'Import',
        danger: true,
      })
      if (ok) {
        board.loadBoardState(pendingImport.tasks, pendingImport.filters)
        showToast('Board imported')
      }
      setPendingImport(null)
    }

    void run()
  }, [pendingImport]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset board?',
      message: 'Your current tasks will be replaced with sample data. Export first if you need a backup.',
      confirmLabel: 'Reset',
      danger: true,
    })
    if (ok) {
      board.resetToSample()
      showToast('Board reset to sample data')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen || confirmState) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openNewTask(activeColumnId)
      }
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, confirmState, activeColumnId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <Header
        taskCount={board.tasks.length}
        filteredCount={board.filteredTasks.length}
        totalPoints={getTotalStoryPoints(board.filteredTasks)}
        hasActiveFilters={board.hasActiveFilters}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
      />

      <FilterBar
        ref={searchInputRef}
        filters={board.filters}
        onChange={board.setFilters}
        onClear={() => board.setFilters({ search: '', priority: 'all', label: 'all', assignee: '' })}
        hiddenCount={board.tasks.length - board.filteredTasks.length}
      />

      {!noticeDismissed && (
        <div className="local-notice">
          <span>
            All data stays in your browser — nothing is sent to a server. Use Export to back up.
          </span>
          <button
            type="button"
            className="local-notice__dismiss"
            onClick={() => {
              dismissNotice()
              setNoticeDismissed(true)
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="app__main">
        <Board
          board={board}
          onTaskClick={openEditTask}
          onAddTask={openNewTask}
          onActiveColumnChange={setActiveColumnId}
        />
      </main>

      <button
        type="button"
        className="fab"
        onClick={() => openNewTask(activeColumnId)}
        aria-label="Add new task"
        title={`Add task to ${COLUMNS.find((c) => c.id === activeColumnId)?.title ?? 'column'}`}
      >
        +
      </button>

      <TaskModal
        task={editingTask}
        draft={draft}
        isOpen={modalOpen}
        isNew={isNew}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={!isNew ? handleDelete : undefined}
      />

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          danger={confirmState.danger}
          onConfirm={() => dismissConfirm(true)}
          onCancel={() => dismissConfirm(false)}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleFileChange} />
    </div>
  )
}
