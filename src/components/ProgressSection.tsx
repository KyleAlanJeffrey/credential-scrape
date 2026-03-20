import { human } from '#/lib/utils.ts'

interface ProgressSectionProps {
  stats: { repos: number; files: number; matches: number }
  progress: number
  isScanning: boolean
  status: { text: string; rateLimited: boolean } | null
}

export default function ProgressSection({ stats, progress, isScanning, status }: ProgressSectionProps) {
  const isIndeterminate = isScanning && progress === 0

  return (
    <div className="progress-wrap">
      <div className={`progress-track${isIndeterminate ? ' indeterminate' : ''}`} id="progressTrack">
        <div
          className={`progress-fill${isScanning ? ' active' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="stats">
        Repos: <strong>{human(stats.repos)}</strong>
        &nbsp;&nbsp;Files: <strong>{human(stats.files)}</strong>
        &nbsp;&nbsp;Findings: <strong>{human(stats.matches)}</strong>
      </div>
      {status && (
        <div className="scan-status visible">
          <span className={`pulse-dot${status.rateLimited ? ' rate-limited' : ''}`} />
          <span dangerouslySetInnerHTML={{ __html: status.text }} />
        </div>
      )}
    </div>
  )
}
