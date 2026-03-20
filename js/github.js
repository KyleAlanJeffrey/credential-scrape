import { sleep } from './utils.js';
import { setStatus, showRateBanner, hideRateBanner } from './ui.js';

export function githubClient(token, signal) {
  const base = 'https://api.github.com';
  const headers = { 'Accept': 'application/vnd.github+json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
  let q = Promise.resolve();
  const delay = token ? 20 : 100;

  async function request(path) {
    for (;;) {
      await (q = q.then(() => sleep(delay)));
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      const res = await fetch(base + path, { headers, signal });

      if (res.status === 403 || res.status === 429) {
        let body = {};
        try { body = await res.json(); } catch (_) {}
        const msg = (body.message || '').toLowerCase();
        if (msg.includes('rate limit') || res.status === 429) {
          const resetHeader = res.headers.get('x-ratelimit-reset');
          const resetAt = resetHeader ? parseInt(resetHeader) * 1000 : Date.now() + 65_000;
          await waitForRateLimit(resetAt, token);
          continue;
        }
        const t = JSON.stringify(body);
        throw new Error(`GitHub 403: ${t.slice(0, 200)}`);
      }

      if (!res.ok) {
        let t = '';
        try { t = await res.text(); } catch (_) {}
        throw new Error(`GitHub ${res.status}: ${t.slice(0, 200)}`);
      }

      return { json: await res.json(), headers: res.headers };
    }
  }

  async function paged(path) {
    let url = path, out = [];
    while (url) {
      const r = await request(url);
      out = out.concat(r.json);
      const lnk = r.headers.get('link');
      url = (lnk && lnk.includes('rel="next"'))
        ? (lnk.match(/<([^>]+)>; rel="next"/) || [])[1]?.replace(base, '') ?? null
        : null;
    }
    return out;
  }

  return { request, paged };
}

let rateLimitInterval = null;

async function waitForRateLimit(resetAt, hasToken) {
  const buffer = 3000;
  const waitUntil = resetAt + buffer;
  const resetTime = new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  setStatus('Rate limited — waiting to resume…', true);

  if (rateLimitInterval) clearInterval(rateLimitInterval);
  rateLimitInterval = setInterval(() => {
    const secs = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000));
    const tip = hasToken ? '' : ' Add a token for 5000 req/hr instead of 60.';
    showRateBanner(
      `<strong>Rate limit reached.</strong> Resuming at ${resetTime} — ${secs}s remaining.${tip}`
    );
    if (secs <= 0) { clearInterval(rateLimitInterval); rateLimitInterval = null; }
  }, 500);

  const secs0 = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000));
  const tip0 = hasToken ? '' : ' Add a token for 5000 req/hr instead of 60.';
  showRateBanner(`<strong>Rate limit reached.</strong> Resuming at ${resetTime} — ${secs0}s remaining.${tip0}`);

  const remaining = waitUntil - Date.now();
  if (remaining > 0) await sleep(remaining);
  hideRateBanner();
}
