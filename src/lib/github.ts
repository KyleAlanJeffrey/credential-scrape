import { sleep, abortableSleep } from './utils.ts'

export interface RateLimitCallbacks {
  onStatusUpdate: (text: string, rateLimited: boolean) => void
  onRateBannerShow: (message: string) => void
  onRateBannerHide: () => void
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GitHubClient {
  request: (path: string) => Promise<{ json: any; headers: Headers }>
  paged: (path: string) => Promise<any[]>
}

export function githubClient(
  token: string,
  signal: AbortSignal,
  callbacks: RateLimitCallbacks,
): GitHubClient {
  const base = 'https://api.github.com'
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  let q = Promise.resolve()
  const delay = token ? 20 : 100

  async function request(path: string) {
    for (;;) {
      await (q = q.then(() => sleep(delay)))
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')

      const res = await fetch(base + path, { headers, signal })

      if (res.status === 403 || res.status === 429) {
        let body: any = {}
        try { body = await res.json() } catch (_) { /* ignore */ }
        const msg = (body.message || '').toLowerCase()
        if (msg.includes('rate limit') || res.status === 429) {
          const resetHeader = res.headers.get('x-ratelimit-reset')
          const resetAt = resetHeader ? parseInt(resetHeader) * 1000 : Date.now() + 65_000
          await waitForRateLimit(resetAt, !!token, signal, callbacks)
          continue
        }
        const t = JSON.stringify(body)
        throw new Error(`GitHub 403: ${t.slice(0, 200)}`)
      }

      if (!res.ok) {
        let t = ''
        try { t = await res.text() } catch (_) { /* ignore */ }
        throw new Error(`GitHub ${res.status}: ${t.slice(0, 200)}`)
      }

      return { json: await res.json(), headers: res.headers }
    }
  }

  async function paged(path: string) {
    let url: string | null = path
    let out: any[] = []
    while (url) {
      const r = await request(url)
      out = out.concat(r.json)
      const lnk = r.headers.get('link')
      url =
        lnk && lnk.includes('rel="next"')
          ? (lnk.match(/<([^>]+)>; rel="next"/) || [])[1]?.replace(base, '') ?? null
          : null
    }
    return out
  }

  return { request, paged }
}

async function waitForRateLimit(
  resetAt: number,
  hasToken: boolean,
  signal: AbortSignal,
  callbacks: RateLimitCallbacks,
) {
  const buffer = 3000
  const waitUntil = resetAt + buffer
  const resetTime = new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  callbacks.onStatusUpdate('Rate limited — waiting to resume…', true)

  const interval = setInterval(() => {
    const secs = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000))
    const tip = hasToken ? '' : ' Add a token for 5000 req/hr instead of 60.'
    callbacks.onRateBannerShow(
      `<strong>Rate limit reached.</strong> Resuming at ${resetTime} — ${secs}s remaining.${tip}`,
    )
    if (secs <= 0) clearInterval(interval)
  }, 500)

  const secs0 = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000))
  const tip0 = hasToken ? '' : ' Add a token for 5000 req/hr instead of 60.'
  callbacks.onRateBannerShow(
    `<strong>Rate limit reached.</strong> Resuming at ${resetTime} — ${secs0}s remaining.${tip0}`,
  )

  const remaining = waitUntil - Date.now()
  try {
    if (remaining > 0) await abortableSleep(remaining, signal)
  } finally {
    clearInterval(interval)
    callbacks.onRateBannerHide()
  }
}
