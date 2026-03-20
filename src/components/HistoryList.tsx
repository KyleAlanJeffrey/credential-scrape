import { Link } from '@tanstack/react-router'
import { human } from '#/lib/utils.ts'
import { formatRelative } from '#/hooks/useHistory.ts'
import type { HistoryEntry } from '#/lib/types.ts'

interface HistoryListProps {
  entries: HistoryEntry[]
  onDelete: (id: number) => void
  onClear: () => void
}

export default function HistoryList({ entries, onDelete, onClear }: HistoryListProps) {
  if (!entries.length) return null

  return (
    <div className="history-section" id="historySection">
      <div className="history-header">
        <span className="history-title">Previous Scans</span>
        <button className="history-clear" onClick={onClear}>
          Clear All
        </button>
      </div>
      <ul className="history-list">
        {entries.map(h => (
          <li key={h.id} className="history-item">
            <span className="history-user">
              {h.username}
            </span>
            <span className="history-meta">
              <span>
                <strong>{human(h.findings)}</strong> finding{h.findings !== 1 ? 's' : ''}
              </span>
              <span>
                <strong>{human(h.filesScanned)}</strong> files
              </span>
            </span>
            <span className="history-date">{formatRelative(new Date(h.date))}</span>
            {h.hasResults && (
              <Link
                to="/results/$id"
                params={{ id: String(h.id) }}
                className="history-view"
                title="View results"
                onClick={e => e.stopPropagation()}
              >
                View
              </Link>
            )}
            <button
              className="history-delete"
              title="Remove"
              onClick={e => { e.stopPropagation(); onDelete(h.id) }}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
