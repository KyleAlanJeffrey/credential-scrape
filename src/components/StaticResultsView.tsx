import { useState, useCallback, useMemo } from 'react'
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
  const isClean = matches.length === 0

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0 }
    for (const m of matches) {
      counts[m.severity]++
    }
    return counts
  }, [matches])

  return (
    <div className="results-area">
      {/* Scan metadata */}
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

      {/* Status banner */}
      {isClean ? (
        <div className="scan-banner scan-banner-clean">
          <div className="scan-banner-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="scan-banner-content">
            <div className="scan-banner-title">No secrets found</div>
            <div className="scan-banner-subtitle">
              Scanned {human(files)} file{files !== 1 ? 's' : ''} across {human(repos)} repo{repos !== 1 ? 's' : ''} — no leaked credentials detected.
            </div>
          </div>
        </div>
      ) : (
        <div className="scan-banner scan-banner-alert">
          <div className="scan-banner-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="scan-banner-content">
            <div className="scan-banner-title">
              {human(matches.length)} secret{matches.length !== 1 ? 's' : ''} found
            </div>
            <div className="scan-banner-subtitle">
              {human(files)} file{files !== 1 ? 's' : ''} scanned across {human(repos)} repo{repos !== 1 ? 's' : ''}
            </div>
            <div className="scan-banner-severity">
              {severityCounts.critical > 0 && (
                <span className="severity-pill critical">{severityCounts.critical} critical</span>
              )}
              {severityCounts.high > 0 && (
                <span className="severity-pill high">{severityCounts.high} high</span>
              )}
              {severityCounts.medium > 0 && (
                <span className="severity-pill medium">{severityCounts.medium} medium</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isClean && (
        <div className="results-actions">
          <button className="export-btn visible" onClick={handleExport}>
            Export JSON
          </button>
          <button
            className={`share-btn visible${copied ? ' copied' : ''}`}
            onClick={handleShare}
          >
            {copied ? 'Copied!' : 'Share Link'}
          </button>
        </div>
      )}

      {/* Findings list */}
      {!isClean && (
        <div id="results">
          {matches.map((m, i) => (
            <ResultCard key={`${m.repo}-${m.path}-${m.line}-${i}`} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}
