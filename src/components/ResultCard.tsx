import { useState } from 'react'
import { esc } from '#/lib/utils.ts'
import { PATTERN_DESCRIPTIONS } from '#/lib/patternInfo.ts'
import type { Match } from '#/lib/types.ts'

function highlight(snippet: string, match: string): string {
  return esc(snippet).replace(esc(match), `<mark>${esc(match)}</mark>`)
}

interface ResultCardProps {
  match: Match
}

export default function ResultCard({ match: m }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false)
  const sev = m.severity === 'critical' ? 'critical' : m.severity === 'high' ? 'high' : 'medium'
  const info = PATTERN_DESCRIPTIONS[m.pattern]

  return (
    <div className={`match severity-${sev}`}>
      <div className="match-top">
        <span className={`badge ${sev}`}>{m.severity}</span>
        <span className="match-pattern">{m.pattern}</span>
        <a
          className="match-link"
          href={m.html_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m.repo} / {m.path} :{m.line}
        </a>
      </div>

      {info && (
        <div className="match-description">{info.description}</div>
      )}

      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlight(m.snippet, m.match) }} />
      </pre>

      {info && (
        <>
          <button
            className="match-details-toggle"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div className="match-details">
              <div className="match-detail-row">
                <span className="match-detail-label">Risk</span>
                <span className="match-detail-text">{info.risk}</span>
              </div>
              <div className="match-detail-row">
                <span className="match-detail-label">Action</span>
                <span className="match-detail-text">{info.action}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
