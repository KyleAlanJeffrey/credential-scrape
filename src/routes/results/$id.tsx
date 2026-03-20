import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import StaticResultsView from '#/components/StaticResultsView.tsx'
import { loadScanResults } from '#/lib/scanStorage.ts'
import { restoreFromHash } from '#/lib/share.ts'
import { getHistoryEntry } from '#/hooks/useHistory.ts'
import type { Match, HistoryEntry } from '#/lib/types.ts'

export const Route = createFileRoute('/results/$id')({
  component: ResultsPage,
})

function ResultsPage() {
  const { id } = Route.useParams()
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [entry, setEntry] = useState<HistoryEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // No body.scanned class needed — this page has no hero to collapse

  useEffect(() => {
    async function load() {
      try {
        if (id === 'shared') {
          const restored = await restoreFromHash()
          if (restored) {
            setMatches(restored)
          } else {
            setError('No shared results found in the URL.')
          }
        } else {
          const numId = Number(id)
          const stored = loadScanResults(numId)
          const histEntry = getHistoryEntry(numId)
          if (stored) {
            setMatches(stored)
            setEntry(histEntry)
          } else {
            setError('Scan results not found. They may have been cleared from storage.')
          }
        }
      } catch {
        setError('Failed to load scan results.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <div className="results-page-header">
          <Link to="/" className="back-link">&larr; Back to Scanner</Link>
        </div>
        <div className="results-area">
          <div className="empty-state">Loading results...</div>
        </div>
      </div>
    )
  }

  if (error || !matches) {
    return (
      <div className="page">
        <div className="results-page-header">
          <Link to="/" className="back-link">&larr; Back to Scanner</Link>
        </div>
        <div className="results-area">
          <div className="error-card">{error || 'Results not found.'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-enter">
      <div className="results-page-header">
        <Link to="/" className="back-link">&larr; Back to Scanner</Link>
        {entry && <h2 className="results-page-title">Scan: {entry.username}</h2>}
        {id === 'shared' && <h2 className="results-page-title">Shared Results</h2>}
      </div>
      <StaticResultsView matches={matches} entry={entry} />
    </div>
  )
}
