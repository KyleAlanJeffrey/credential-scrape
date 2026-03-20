import { createFileRoute, Link } from '@tanstack/react-router'
import { PATTERNS } from '#/lib/patterns.ts'
import { PATTERN_DESCRIPTIONS } from '#/lib/patternInfo.ts'
import { groupPatterns } from '#/lib/patternGroups.ts'

export const Route = createFileRoute('/patterns')({
  component: PatternsPage,
  head: () => ({
    meta: [
      { title: 'Detection Rules — Secret Scanner' },
      { name: 'description', content: `${PATTERNS.length} credential detection patterns for AWS, Stripe, OpenAI, GitHub tokens, private keys, database URIs, and more. Full descriptions, risk assessments, and remediation steps.` },
      { property: 'og:title', content: 'Detection Rules — Secret Scanner' },
      { property: 'og:description', content: `${PATTERNS.length} credential detection patterns with risk assessments and remediation guidance.` },
      { name: 'twitter:title', content: 'Detection Rules — Secret Scanner' },
      { name: 'twitter:description', content: `${PATTERNS.length} credential detection patterns with risk assessments and remediation guidance.` },
    ],
  }),
})

const groups = groupPatterns(PATTERNS)

function PatternsPage() {
  return (
    <div className="page page-enter">
      <div className="patterns-page-header">
        <Link to="/" className="back-link">&larr; Back to Scanner</Link>
        <h1 className="patterns-page-title">Detection Rules</h1>
        <p className="patterns-page-subtitle">{PATTERNS.length} patterns across {groups.length} categories</p>
      </div>

      <div className="patterns-page-content">
        {groups.map(([group, patterns]) => (
          <div key={group} className="patterns-page-group">
            <h2 className="patterns-page-group-title">{group}</h2>
            <div className="patterns-page-grid">
              {patterns.map(p => {
                const info = PATTERN_DESCRIPTIONS[p.name]
                return (
                  <div key={p.name} className={`patterns-page-card severity-border-${p.severity}`}>
                    <div className="patterns-page-card-header">
                      <span className={`badge ${p.severity}`}>{p.severity}</span>
                      <span className="patterns-page-card-name">{p.name}</span>
                    </div>
                    {info && (
                      <>
                        <p className="patterns-page-card-desc">{info.description}</p>
                        <div className="patterns-page-card-details">
                          <div className="patterns-page-detail">
                            <span className="patterns-page-detail-label">Risk</span>
                            <span className="patterns-page-detail-text">{info.risk}</span>
                          </div>
                          <div className="patterns-page-detail">
                            <span className="patterns-page-detail-label">Remediation</span>
                            <span className="patterns-page-detail-text">{info.action}</span>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="patterns-page-card-regex">
                      <code>{p.regex}</code>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
