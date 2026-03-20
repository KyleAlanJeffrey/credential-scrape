import { compiled } from './patterns.ts'
import type { FileMatch, Match } from './types.ts'
import type { GitHubClient } from './github.ts'

const dec = new TextDecoder('utf-8', { fatal: false })

export function looksBinary(u8: Uint8Array): boolean {
  const len = Math.min(u8.length, 2048)
  let z = 0, c = 0
  for (let i = 0; i < len; i++) {
    const b = u8[i]!
    if (b === 0) z++
    if (b < 7 || (b > 13 && b < 32)) c++
  }
  return z > 0 || c / len > 0.3
}

export function matchFile(content: string): FileMatch[] {
  const lines = content.split(/\r?\n/)
  const out: FileMatch[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const p of compiled) {
      p.re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = p.re.exec(line)) !== null) {
        const s = Math.max(0, m.index - 60)
        const e = Math.min(line.length, m.index + (m[0]?.length || 0) + 60)
        out.push({ pattern: p.name, severity: p.severity, line: i + 1, match: m[0]!, snippet: line.slice(s, e) })
        if (!p.re.global) break
      }
    }
  }
  return out
}

export async function scanFile(
  client: GitHubClient,
  repo: { owner: { login: string }; name: string },
  branch: string,
  path: string,
  sha: string,
): Promise<Match[]> {
  let raw: string
  if (sha) {
    const { json: blob } = await client.request(`/repos/${repo.owner.login}/${repo.name}/git/blobs/${sha}`)
    if (!blob || blob.encoding !== 'base64' || !blob.content) return []
    raw = atob(blob.content.replace(/\n/g, ''))
  } else {
    const { json: f } = await client.request(
      `/repos/${repo.owner.login}/${repo.name}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
    )
    if (!f || f.type !== 'file' || !f.content) return []
    raw = atob(f.content.replace(/\n/g, ''))
  }
  const u8 = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i)
  if (looksBinary(u8)) return []
  return matchFile(dec.decode(u8)).map(m => ({
    repo: `${repo.owner.login}/${repo.name}`,
    branch,
    path,
    html_url: `https://github.com/${repo.owner.login}/${repo.name}/blob/${encodeURIComponent(branch)}/${path}#L${m.line}`,
    ...m,
  }))
}

export const SKIP_DIRS = [
  'node_modules/', 'vendor/', 'dist/', 'build/', 'target/', '.next/', '.git/',
  '__pycache__/', 'venv/', '.venv/', '.tox/', '.mypy_cache/', '.pytest_cache/',
  '.gradle/', '.mvn/', '.cargo/', 'bower_components/', 'jspm_packages/',
  '.bundle/', '.eggs/', '.sass-cache/', '.cache/', '.parcel-cache/',
  'coverage/', '.nyc_output/', 'obj/', 'bin/', 'packages/', 'artifacts/',
  '.terraform/', '.serverless/', 'cdk.out/', '.aws-sam/',
]

export const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', '.avif',
  '.mp3', '.mp4', '.wav', '.ogg', '.webm', '.mov', '.avi', '.flac',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar', '.jar', '.war',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.o', '.a', '.class', '.pyc', '.pyo',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.lock', '.min.js', '.min.css', '.map',
  '.DS_Store', '.wasm',
])

export const MAX_FILE_SIZE = 512 * 1024

export const SKIP_FILENAMES = new Set([
  '.DS_Store', 'Thumbs.db', 'desktop.ini',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'composer.lock', 'Gemfile.lock', 'Cargo.lock', 'poetry.lock', 'go.sum',
])
