import { useState, useCallback } from 'react'
import ProgressSection from './ProgressSection.tsx'
import RateBanner from './RateBanner.tsx'
import ResultCard from './ResultCard.tsx'
import { exportJSON, createShareUrl } from '#/lib/share.ts'
import type { Match, Message } from '#/lib/types.ts'

interface ResultsAreaProps {
  isScanning: boolean
  stats: { repos: number; files: number; matches: number }
  progress: number
  status: { text: string; rateLimited: boolean } | null
  rateBanner: string | null
  matches: Match[]
  messages: Message[]
}

export default function ResultsArea({
  isScanning,
  stats,
  progress,
  status,
  rateBanner,
  matches,
  messages,
}: ResultsAreaProps) {
  const [copied, setCopied] = useState(false)
  const hasFindings = matches.length > 0

  const handleExport = useCallback(() => {
    exportJSON(matches)
  }, [matches])

  const handleShare = useCallback(async () => {
    const url = await createShareUrl(matches)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [matches])

  return (
    <div className="results-area">
      <ProgressSection
        stats={stats}
        progress={progress}
        isScanning={isScanning}
        status={status}
      />

      <RateBanner message={rateBanner} />

      <div className="results-header">
        <div className="findings-count">
          {hasFindings && `${matches.length} finding${matches.length !== 1 ? 's' : ''}`}
        </div>
        {hasFindings && (
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
        {messages.map(msg => (
          <div key={msg.id} className={msg.type === 'error' ? 'error-card' : 'info-card'}>
            {msg.text}
          </div>
        ))}
        {matches.map((m, i) => (
          <ResultCard key={`${m.repo}-${m.path}-${m.line}-${i}`} match={m} />
        ))}
      </div>
    </div>
  )
}
