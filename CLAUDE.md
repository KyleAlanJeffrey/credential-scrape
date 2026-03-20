# Secret Scanner

A client-side web app that scans a GitHub user's repositories for leaked credentials (API keys, tokens, passwords, private keys, etc.) using regex pattern matching.

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR) + TanStack Router
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4 + custom CSS theme
- **Language**: TypeScript (strict mode)
- **State**: React hooks (useState, useRef, useCallback) — no external state library

## Architecture

```
src/
├── routes/              TanStack Router file-based routes
│   ├── __root.tsx       Root layout (html/head/body, providers, devtools)
│   └── index.tsx        Main scanner page — composes all components
├── components/
│   ├── SearchBar.tsx    Username input + scan/stop button + token input
│   ├── ProgressSection.tsx  Progress bar + stats counters + scan status line
│   ├── RateBanner.tsx   Rate limit warning banner
│   ├── ResultCard.tsx   Single finding card (severity badge, snippet, link)
│   ├── ResultsArea.tsx  Wraps progress, banner, header, and result cards
│   └── HistoryList.tsx  Previous scans list from localStorage
├── hooks/
│   ├── useScanner.ts    Main scan orchestration (start/stop/pause/resume)
│   └── useHistory.ts    Scan history (localStorage) + cookie persistence
├── lib/
│   ├── types.ts         Shared TypeScript interfaces
│   ├── patterns.ts      Credential regex patterns (severity-tagged)
│   ├── scanner.ts       File content matching, binary detection, skip lists
│   ├── github.ts        GitHub REST API client with rate limit handling
│   ├── share.ts         JSON export, compress/decompress for shareable URLs
│   └── utils.ts         esc, human, sleep, cn (tailwind-merge)
├── integrations/
│   └── tanstack-query/  QueryClient provider + devtools
├── router.tsx           TanStack Router setup
└── styles.css           Tailwind v4 theme + all custom component styles
```

## Key Behaviors

- Uses GitHub REST API (unauthenticated or with a personal access token)
- Scans file contents via the git blob API for speed
- Supports pause/resume — stopping a scan saves state, pressing "Continue" resumes
- Results are shareable via URL hash (compressed with DeflateStream)
- Token and username persisted in cookies, scan history in localStorage
- Concurrent file scanning (8 with token, 3 without)
- Auto-waits and retries on rate limits with countdown UI
- `body.scanned` CSS class drives layout transition animations (managed via useEffect)

## Development

```sh
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

- Path alias: `#/` maps to `src/` (e.g., `import { useScanner } from '#/hooks/useScanner.ts'`)
- All `.ts` imports include the `.ts` extension (required by verbatimModuleSyntax)
- Components use existing CSS classes from `styles.css` — not Tailwind utility classes for the core UI
- `lib/` modules are pure (no React) — framework-agnostic logic
- `hooks/` contain React-specific state management
- Browser-only APIs (localStorage, cookies, document.body) are accessed inside useEffect
