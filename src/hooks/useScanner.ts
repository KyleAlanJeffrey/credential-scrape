import { useState, useRef, useCallback, useEffect } from 'react'
import { githubClient } from '#/lib/github.ts'
import { scanFile, SKIP_DIRS, SKIP_EXT, MAX_FILE_SIZE, SKIP_FILENAMES } from '#/lib/scanner.ts'
import { esc, human, sleep } from '#/lib/utils.ts'
import type { Match, Message, ScanJob } from '#/lib/types.ts'
import type { RateLimitCallbacks, GitHubClient } from '#/lib/github.ts'
import type { ScanMode } from '#/components/SearchBar.tsx'

interface ScanRunState {
  jobs: ScanJob[]
  idx: number
  done: number
  allMatches: Match[]
  token: string
  username: string
  login: string
}

function parseRepoInput(input: string): { owner: string; repo: string } {
  // Handle GitHub URLs: https://github.com/owner/repo[/...]
  try {
    const url = new URL(input)
    if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        return { owner: parts[0]!, repo: parts[1]! }
      }
    }
  } catch { /* not a URL, try owner/repo */ }

  const slash = input.indexOf('/')
  if (slash > 0 && slash < input.length - 1) {
    return { owner: input.slice(0, slash), repo: input.slice(slash + 1) }
  }

  throw new Error('Enter a repository as owner/repo or paste a GitHub URL')
}

function filterTree(tree: any[], jobs: ScanJob[], repo: any, branch: string) {
  for (const f of tree) {
    if (f.type !== 'blob') continue
    if (SKIP_DIRS.some((d: string) => f.path.includes(d))) continue
    if (typeof f.size === 'number' && f.size > MAX_FILE_SIZE) continue
    const dot = f.path.lastIndexOf('.')
    if (dot !== -1 && SKIP_EXT.has(f.path.slice(dot).toLowerCase())) continue
    const name = f.path.split('/').pop()
    if (SKIP_FILENAMES.has(name)) continue
    jobs.push({ repo, branch, path: f.path, sha: f.sha })
  }
}

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState({ repos: 0, files: 0, matches: 0 })
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<{ text: string; rateLimited: boolean } | null>(null)
  const [rateBanner, setRateBanner] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const abortRef = useRef<AbortController | null>(null)
  const scanStateRef = useRef<ScanRunState | null>(null)
  const msgIdRef = useRef(0)

  useEffect(() => {
    if (hasScanned) {
      document.body.classList.add('scanned')
    } else {
      document.body.classList.remove('scanned')
    }
    return () => document.body.classList.remove('scanned')
  }, [hasScanned])

  const addMessage = useCallback((type: 'info' | 'error', text: string) => {
    setMessages(prev => [...prev, { id: ++msgIdRef.current, type, text }])
  }, [])

  const rateLimitCallbacks: RateLimitCallbacks = {
    onStatusUpdate: (text, rateLimited) => setStatus({ text, rateLimited }),
    onRateBannerShow: (message) => setRateBanner(message),
    onRateBannerHide: () => setRateBanner(null),
  }

  const runFileScanning = useCallback(async (state: ScanRunState) => {
    const { jobs, allMatches } = state
    const signal = abortRef.current!.signal
    const client = githubClient(state.token, signal, rateLimitCallbacks)

    const CONCURRENCY = state.token ? 8 : 3
    let inFlight = 0

    async function next() {
      if (signal.aborted || state.idx >= jobs.length) return
      const { repo, branch, path, sha } = jobs[state.idx++]!
      inFlight++

      setStatus({
        text: `<span class="repo-name">${esc(repo.full_name)}</span> <span class="file-path">/ ${esc(path)}</span>`,
        rateLimited: false,
      })

      try {
        const res = await scanFile(client, repo, branch, path, sha)
        state.done++
        const pct = Math.round((state.done / jobs.length) * 100)
        setStats(s => ({ ...s, files: state.done, matches: allMatches.length + (res?.length || 0) }))
        setProgress(pct)
        if (res?.length) {
          allMatches.push(...res)
          setMatches([...allMatches])
        }
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') { /* ignore */ }
        else addMessage('error', e instanceof Error ? e.message : String(e))
      } finally {
        inFlight--
        next()
      }
    }

    for (let i = 0; i < Math.min(CONCURRENCY, jobs.length - state.idx); i++) next()
    while ((state.idx < jobs.length || inFlight > 0) && !signal.aborted) await sleep(80)

    if (!signal.aborted) {
      setStatus(null)
      if (!allMatches.length) addMessage('info', 'No secrets found.')
      scanStateRef.current = null
      setIsPaused(false)
    } else {
      const remaining = jobs.length - state.idx
      setStatus({
        text: `Paused — ${human(remaining)} file${remaining !== 1 ? 's' : ''} remaining. Press Scan to continue.`,
        rateLimited: false,
      })
      setIsPaused(true)
    }

    setIsScanning(false)
    setRateBanner(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage])

  async function fetchReposForAccount(
    client: GitHubClient,
    username: string,
    login: string,
    token: string,
  ) {
    return token
      ? (await client.paged('/user/repos?per_page=100&affiliation=owner&visibility=all&sort=updated'))
          .filter((r: any) => r.owner?.login?.toLowerCase() === login.toLowerCase() && !r.fork && !r.archived)
      : (await client.paged(`/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&sort=updated`))
          .filter((r: any) => !r.fork && !r.archived)
  }

  async function fetchSingleRepo(
    client: GitHubClient,
    owner: string,
    repo: string,
  ) {
    const { json } = await client.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
    return [json]
  }

  const startScan = useCallback(async (target: string, token: string, mode: ScanMode = 'account') => {
    if (!target) return

    // Resume from paused state if same target
    if (
      scanStateRef.current &&
      scanStateRef.current.username.toLowerCase() === target.toLowerCase() &&
      scanStateRef.current.idx < scanStateRef.current.jobs.length
    ) {
      setIsScanning(true)
      setIsPaused(false)
      setRateBanner(null)
      abortRef.current = new AbortController()
      await runFileScanning(scanStateRef.current)
      return
    }

    // Fresh scan
    setIsScanning(true)
    setHasScanned(true)
    setIsPaused(false)
    setMatches([])
    setMessages([])
    setStats({ repos: 0, files: 0, matches: 0 })
    setProgress(0)
    setRateBanner(null)

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    const client = githubClient(token, signal, rateLimitCallbacks)
    const allMatches: Match[] = []

    try {
      setStatus({ text: 'Connecting to GitHub…', rateLimited: false })

      let repos: any[]
      let login = target

      if (mode === 'repo') {
        // Single repo mode: target is "owner/repo" or a GitHub URL
        const { owner, repo: repoName } = parseRepoInput(target)

        if (!token) {
          addMessage('info', 'No token — scanning public repo only (rate limit ~60 req/hr).')
        }

        setStatus({ text: `Fetching ${esc(target)}…`, rateLimited: false })
        repos = await fetchSingleRepo(client, owner, repoName)
        login = owner
      } else {
        // Account mode: target is a username
        if (token) {
          const { json: me } = await client.request('/user')
          login = me.login
          if (login.toLowerCase() !== target.toLowerCase()) {
            throw new Error(`Token belongs to "${login}" but you entered "${target}".`)
          }
        } else {
          addMessage('info', 'No token — scanning public repos only (rate limit ~60 req/hr). Add a token above for private repos and higher limits.')
        }

        setStatus({ text: 'Fetching repository list…', rateLimited: false })
        repos = await fetchReposForAccount(client, target, login, token)
      }

      setStats(s => ({ ...s, repos: repos.length }))

      if (!repos.length) {
        setStatus({ text: 'No repositories found.', rateLimited: false })
        setIsScanning(false)
        return
      }

      const jobs: ScanJob[] = []

      for (const repo of repos) {
        if (signal.aborted) break
        const branch = repo.default_branch || 'main'
        setStatus({
          text: `<span class="repo-name">${esc(repo.full_name)}</span> — reading tree…`,
          rateLimited: false,
        })

        let tree: any[]
        try {
          const { json } = await client.request(
            `/repos/${repo.owner.login}/${repo.name}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
          )
          tree = json.tree || []
        } catch (e: unknown) {
          if (e instanceof DOMException && e.name === 'AbortError') break
          if (e instanceof Error && e.message.includes('409')) continue
          addMessage('error', `${repo.full_name}: ${e instanceof Error ? e.message : String(e)}`)
          continue
        }

        filterTree(tree, jobs, repo, branch)
      }

      const state: ScanRunState = { jobs, idx: 0, done: 0, allMatches, token, username: target, login }
      scanStateRef.current = state

      if (signal.aborted) {
        setIsScanning(false)
        setIsPaused(true)
        const remaining = jobs.length
        setStatus({
          text: `Paused — ${human(remaining)} file${remaining !== 1 ? 's' : ''} remaining. Press Scan to continue.`,
          rateLimited: false,
        })
        return
      }

      await runFileScanning(state)
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        addMessage('error', err instanceof Error ? err.message : String(err))
      }
      setStatus(null)
      setIsScanning(false)
      setRateBanner(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage, runFileScanning])

  const stopScan = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const restoreResults = useCallback((restored: Match[]) => {
    setHasScanned(true)
    setMatches(restored)
    setStats({
      repos: new Set(restored.map(m => m.repo)).size,
      files: new Set(restored.map(m => m.repo + '/' + m.path)).size,
      matches: restored.length,
    })
    setProgress(100)
  }, [])

  return {
    isScanning,
    hasScanned,
    isPaused,
    stats,
    progress,
    status,
    rateBanner,
    matches,
    messages,
    startScan,
    stopScan,
    restoreResults,
  }
}
