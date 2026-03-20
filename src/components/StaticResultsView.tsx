import { useState, useCallback } from 'react'
import ResultCard from './ResultCard.tsx'
import { exportJSON, createShareUrl } from '#/lib/share.ts'
import { human } from '#/lib/utils.ts'
import { formatRelative } from '#/hooks/useHistory.ts'
import type { Match, HistoryEntry } from '#/lib/types.ts'

interface StaticResultsViewProps {
  matches: Match[]
  entry?: HistoryEntry | null
}

export default function StaticResultsView({ matches, entry }: StaticResultsViewProps) {
  const [copied, setCopied] = useState(false)

  const handleExport = useCallback(() => {
    exportJSON(matches)
  }, [matches])

  const handleShare = useCallback(async () => {
    const url = await createShareUrl(matches)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [matches])

  const repos = new Set(matches.map(m => m.repo)).size
  const files = new Set(matches.map(m => m.repo + '/' + m.path)).size

  return (
    <div className="results-area">
      {entry && (
        <div className="results-meta">
          <div className="results-meta-user">{entry.username}</div>
          <div className="results-meta-details">
            <span>{human(repos)} repo{repos !== 1 ? 's' : ''}</span>
            <span>{human(entry.filesScanned)} files scanned</span>
            <span>{formatRelative(new Date(entry.date))}</span>
          </div>
        </div>
      )}

      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '100%' }} />
        </div>
        <div className="stats">
          Repos: <strong>{human(repos)}</strong>
          &nbsp;&nbsp;Files: <strong>{human(files)}</strong>
          &nbsp;&nbsp;Findings: <strong>{human(matches.length)}</strong>
        </div>
      </div>

      <div className="results-header">
        <div className="findings-count">
          {matches.length > 0 && `${matches.length} finding${matches.length !== 1 ? 's' : ''}`}
        </div>
        {matches.length > 0 && (
          <>
            <button className="export-btn visible" onClick={handleExport}>
              Export JSON
            </button>
            <button
              className={`share-btn visible${copied ? ' copied' : ''}`}
              onClick={handleShare}
            >
              {copied ? 'Copied!' : 'Share Link'}
            </button>
          </>
        )}
      </div>

      <div id="results">
        {matches.length === 0 && (
          <div className="empty-state">No secrets found.</div>
        )}
        {matches.map((m, i) => (
          <ResultCard key={`${m.repo}-${m.path}-${m.line}-${i}`} match={m} />
        ))}
      </div>
    </div>
  )
}
