import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { PATTERNS } from '#/lib/patterns.ts'
import { groupPatterns } from '#/lib/patternGroups.ts'

const groups = groupPatterns(PATTERNS)

export default function PatternsInfo() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="patterns-info-wrap">
      <button
        ref={btnRef}
        className="patterns-info-btn"
        onClick={() => setOpen(v => !v)}
      >
        What we detect
      </button>
      {open && (
        <div ref={panelRef} className="patterns-info-panel">
          <div className="patterns-info-header">
            <span className="patterns-info-title">Detection Rules ({PATTERNS.length})</span>
            <button className="patterns-info-close" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="patterns-info-body">
            {groups.map(([group, patterns]) => (
              <div key={group} className="patterns-group">
                <div className="patterns-group-title">{group}</div>
                {patterns.map(p => (
                  <div key={p.name} className="patterns-item">
                    <span className={`patterns-severity ${p.severity}`} />
                    <span className="patterns-name">{p.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="patterns-info-footer">
            <Link to="/patterns" className="patterns-view-all" onClick={() => setOpen(false)}>
              View full details
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
