# Secret Scanner

Scan a GitHub user's public (or private) repositories for leaked credentials — API keys, tokens, passwords, private keys, and more. Runs entirely in the browser.

## Features

- **10 credential patterns** — AWS keys, GitHub tokens, Google API keys, Slack tokens, private keys, JWTs, generic secrets
- **Severity classification** — critical, high, and medium findings
- **Pause/resume** — stop a scan and pick up where you left off
- **Rate limit handling** — auto-waits and retries with a live countdown
- **Shareable results** — compressed into a URL hash, no server needed
- **JSON export** — download findings for further analysis
- **Scan history** — previous scans saved in localStorage for quick re-runs
- **Private repo support** — provide a GitHub PAT to scan non-public repos at 5000 req/hr

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a GitHub username, and hit **Scan**.

Optionally paste a [GitHub personal access token](https://github.com/settings/tokens) for private repo access and higher rate limits.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

## Tech Stack

- React 19 + TanStack Start + TanStack Router
- Vite 7
- Tailwind CSS v4
- TypeScript

## How It Works

1. Fetches the user's repository list via the GitHub REST API
2. Reads each repo's git tree to enumerate files (skipping binaries, lock files, build artifacts)
3. Downloads file contents via the git blob API
4. Runs regex patterns against each file line-by-line
5. Displays matches as severity-tagged cards with links to the source on GitHub

All processing happens client-side. No data is sent to any server other than `api.github.com`.
