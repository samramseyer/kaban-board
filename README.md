# Kaban Board

A fully functional Kanban board built for software development teams. Track tasks through your workflow from backlog to done with drag-and-drop, priorities, labels, story points, and more.

## Features

- **Six workflow columns**: Backlog → To Do → In Progress → Code Review → QA / Testing → Done
- **Drag and drop** tasks between columns and reorder within a column
- **Rich task cards**: title, description, priority, labels, assignee, story points, due dates
- **Search and filters** by text, priority, label, and assignee
- **Auto-save** to browser localStorage
- **100% local** — no accounts, no server, no network requests for your data
- **Import / export** board data as JSON
- **Sample data** pre-loaded on first visit

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite
- [@dnd-kit](https://dndkit.com/) for accessible drag-and-drop
- LocalStorage persistence

## Usage

| Action | How |
|--------|-----|
| Add task | Click **+ Add task** in a column or the floating **+** button |
| Edit task | Click a task card |
| Move task | Drag a card to another column |
| Reorder | Drag a card above/below another in the same column |
| Filter | Use the search bar and dropdown filters |
| Export | Header → **Export** saves a JSON file |
| Import | Header → **Import** loads a JSON file |
| Reset | Header → **Reset** restores sample tasks |

## Data & Privacy

All board data lives **only in your browser**:

| Stored locally | Not used |
|----------------|----------|
| Tasks (title, description, column, priority, labels, assignee, story points, due dates) | User accounts |
| Filter preferences | Cloud sync |
| Task order and timestamps | Analytics or tracking |

Data is saved automatically to `localStorage` under the key `kaban-board-v1`. Clearing browser data for this site will remove your board — use **Export** to create a backup JSON file.

The only external requests are Google Fonts loaded from the CDN (optional styling). Your task data never leaves your device unless you explicitly export it.

## License

MIT
