import { esc } from '#/lib/utils.ts'
import type { Match } from '#/lib/types.ts'

function highlight(snippet: string, match: string): string {
  return esc(snippet).replace(esc(match), `<mark>${esc(match)}</mark>`)
}

interface ResultCardProps {
  match: Match
}

export default function ResultCard({ match: m }: ResultCardProps) {
  const sev = m.severity === 'critical' ? 'critical' : m.severity === 'high' ? 'high' : 'medium'

  return (
    <div className="match">
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
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlight(m.snippet, m.match) }} />
      </pre>
    </div>
  )
}
