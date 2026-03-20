# Secret Scanner

A client-side web app that scans a GitHub user's repositories for leaked credentials (API keys, tokens, passwords, private keys, etc.) using regex pattern matching.

## Architecture

No build step — plain HTML/CSS/JS with ES modules served directly from the filesystem or a static server.

### File Structure

- `index.html` — Page markup and meta tags. Links to `style.css` and `js/app.js`.
- `style.css` — All styles. Dark theme with CSS custom properties (`--bg`, `--surface`, `--accent`, etc.).
- `js/` — JavaScript modules:
  - `app.js` — Main entry point. Scan orchestration (start, pause/resume, stop), DOM event binding.
  - `patterns.js` — Credential regex patterns array and compiled regexes. Each pattern has `name`, `regex`, `flags`, `severity` (critical/high/medium).
  - `scanner.js` — File content matching (`matchFile`), binary detection (`looksBinary`), single-file scanning (`scanFile`), skip lists for directories/extensions/filenames.
  - `github.js` — GitHub API client with rate limiting, pagination, auto-retry on 429/403.
  - `ui.js` — DOM helpers: status line, progress bar, rate limit banner, match cards, info/error cards.
  - `share.js` — Export to JSON, compress/decompress results for shareable URL hash links.
  - `history.js` — Scan history in localStorage, cookie persistence for token/username.
  - `utils.js` — Shared utilities: `$` (querySelector), `sleep`, `human` (number formatting), `esc` (HTML escaping).

## Key Behaviors

- Uses GitHub REST API (unauthenticated or with a personal access token)
- Scans file contents via the git blob API for speed
- Supports pause/resume — stopping a scan saves state, pressing "Continue" resumes
- Results are shareable via URL hash (compressed with DeflateStream)
- Token and username persisted in cookies, scan history in localStorage
- Concurrent file scanning (8 with token, 3 without)
- Auto-waits and retries on rate limits with countdown UI

## Development

Open `index.html` in a browser, or serve with any static file server. ES modules require a server (not `file://`).

```sh
npx serve .
# or
python3 -m http.server
```
