import { forwardRef, useState } from 'react'
import { LABELS, PRIORITIES, TEAM_MEMBERS } from '../constants'
import type { FilterState } from '../types'
import { getTotalStoryPoints } from '../utils/storage'

interface HeaderProps {
  taskCount: number
  filteredCount: number
  totalPoints: number
  hasActiveFilters: boolean
  onExport: () => void
  onImport: () => void
  onReset: () => void
}

export function Header({
  taskCount,
  filteredCount,
  totalPoints,
  hasActiveFilters,
  onExport,
  onImport,
  onReset,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__brand">
          <div className="header__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#6366f1" />
              <rect x="6" y="8" width="5" height="16" rx="1.5" fill="#fff" opacity="0.9" />
              <rect x="13.5" y="8" width="5" height="12" rx="1.5" fill="#fff" opacity="0.7" />
              <rect x="21" y="8" width="5" height="18" rx="1.5" fill="#fff" />
            </svg>
          </div>
          <div>
            <h1 className="header__title">Kaban Board</h1>
            <p className="header__subtitle">Software development workflow</p>
            <p className="header__local" title="No account, no server — your board stays on this device">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Stored locally in your browser
            </p>
          </div>
        </div>

        <div className="header__stats">
          <span className="stat">
            <strong>{filteredCount}</strong> / {taskCount} tasks
          </span>
          <span className="stat">
            <strong>{totalPoints}</strong> SP
          </span>
          {hasActiveFilters && filteredCount < taskCount && (
            <span className="stat stat--filter">({taskCount - filteredCount} hidden)</span>
          )}
        </div>

        <div className="header__actions header__actions--desktop">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onImport} title="Import board JSON">
            Import
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onExport} title="Export board JSON">
            Export
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReset} title="Reset to sample data">
            Reset
          </button>
        </div>

        <button
          type="button"
          className="header__menu-btn"
          aria-expanded={menuOpen}
          aria-label="Board actions"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="header__menu">
          <button
            type="button"
            className="header__menu-item"
            onClick={() => {
              onImport()
              setMenuOpen(false)
            }}
          >
            Import board
          </button>
          <button
            type="button"
            className="header__menu-item"
            onClick={() => {
              onExport()
              setMenuOpen(false)
            }}
          >
            Export board
          </button>
          <button
            type="button"
            className="header__menu-item header__menu-item--danger"
            onClick={() => {
              onReset()
              setMenuOpen(false)
            }}
          >
            Reset to sample data
          </button>
        </div>
      )}
    </header>
  )
}

interface FilterBarProps {
  filters: FilterState
  hiddenCount: number
  onChange: (filters: FilterState) => void
  onClear: () => void
}

export const FilterBar = forwardRef<HTMLInputElement, FilterBarProps>(function FilterBar(
  { filters, hiddenCount, onChange, onClear },
  ref,
) {
  const [expanded, setExpanded] = useState(false)
  const hasFilters =
    filters.search || filters.priority !== 'all' || filters.label !== 'all' || filters.assignee

  return (
    <div className={`filters ${expanded ? 'filters--expanded' : ''}`}>
      <div className="filters__row">
        <div className="filters__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={ref}
            type="search"
            placeholder="Search tasks... (/ to focus)"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        <button
          type="button"
          className="filters__toggle btn btn--ghost btn--sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          Filters
          {hasFilters && <span className="filters__badge" aria-hidden="true" />}
        </button>

        {hasFilters && (
          <button type="button" className="btn btn--ghost btn--sm filters__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {hasFilters && hiddenCount > 0 && (
        <p className="filters__hint">{hiddenCount} task(s) hidden by active filters</p>
      )}

      <div className="filters__panel">
        <select
          value={filters.priority}
          onChange={(e) =>
            onChange({ ...filters, priority: e.target.value as FilterState['priority'] })
          }
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={filters.label}
          onChange={(e) => onChange({ ...filters, label: e.target.value as FilterState['label'] })}
          aria-label="Filter by label"
        >
          <option value="all">All labels</option>
          {LABELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
          aria-label="Filter by assignee"
        >
          <option value="">All assignees</option>
          {TEAM_MEMBERS.filter((m) => m !== 'Unassigned').map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
})

export { getTotalStoryPoints }
