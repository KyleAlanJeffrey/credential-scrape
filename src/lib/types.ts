export interface Pattern {
  name: string
  regex: string
  flags: string
  severity: 'critical' | 'high' | 'medium'
}

export interface CompiledPattern extends Pattern {
  re: RegExp
}

export interface FileMatch {
  pattern: string
  severity: 'critical' | 'high' | 'medium'
  line: number
  match: string
  snippet: string
}

export interface Match extends FileMatch {
  repo: string
  branch: string
  path: string
  html_url: string
}

export interface Message {
  id: number
  type: 'info' | 'error'
  text: string
}

export interface HistoryEntry {
  id: number
  username: string
  date: string
  filesScanned: number
  totalFiles: number
  findings: number
  repos: number
}

export interface ScanJob {
  repo: { owner: { login: string }; name: string; full_name: string }
  branch: string
  path: string
  sha: string
}
