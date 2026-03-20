import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import SearchBar, { type ScanMode } from '#/components/SearchBar.tsx'
import PatternsInfo from '#/components/PatternsInfo.tsx'
import HistoryList from '#/components/HistoryList.tsx'
import ResultsArea from '#/components/ResultsArea.tsx'
import { useScanner } from '#/hooks/useScanner.ts'
import { useHistory } from '#/hooks/useHistory.ts'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'Secret Scanner — Find Leaked Credentials on GitHub' },
      { name: 'description', content: 'Scan a GitHub user or repository for leaked API keys, tokens, passwords, and secrets. Free, client-side, no data leaves your browser.' },
      { property: 'og:title', content: 'Secret Scanner — Find Leaked Credentials on GitHub' },
      { property: 'og:description', content: 'Scan a GitHub user or repository for leaked API keys, tokens, passwords, and secrets.' },
      { name: 'twitter:title', content: 'Secret Scanner — Find Leaked Credentials on GitHub' },
      { name: 'twitter:description', content: 'Scan a GitHub user or repository for leaked API keys, tokens, passwords, and secrets.' },
    ],
  }),
})

function HomePage() {
  const scanner = useScanner()
  const history = useHistory()
  const navigate = useNavigate()
  const tokenRef = useRef<string>('')
  const [transitioning, setTransitioning] = useState(false)

  // Redirect old-format shared URLs to /results/shared
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#results=')) {
      navigate({ to: '/results/$id', params: { id: 'shared' }, hash: window.location.hash })
    }
  }, [navigate])

  // Navigate to results page when scan completes
  useEffect(() => {
    if (!scanner.isScanning && !scanner.isPaused && scanner.hasScanned && scanner.stats.files > 0) {
      const id = history.saveScan(scanner.resolvedName, scanner.stats.files, scanner.stats.files, scanner.matches)
      setTransitioning(true)
      setTimeout(() => {
        navigate({ to: '/results/$id', params: { id: String(id) } })
      }, 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanner.isScanning, scanner.isPaused])

  const handleScan = (target: string, token: string, saveToken: boolean, mode: ScanMode) => {
    if (!target) return
    tokenRef.current = token
    history.persistCredentials(token, saveToken)
    scanner.startScan(target, token, mode)
  }

  return (
    <div className={`page${transitioning ? ' page-exit' : ''}`}>
      <PatternsInfo />
      <div className="hero">
        <h1 className="logo">Secret Scanner</h1>
        <p className="tagline">Find leaked credentials across GitHub repositories.</p>

        <SearchBar
          onScan={handleScan}
          onStop={scanner.stopScan}
          isScanning={scanner.isScanning}
          isPaused={scanner.isPaused}
          savedUsername={history.savedUsername}
          savedRepo={history.savedRepo}
          savedToken={history.savedToken}
          savedRemember={history.rememberToken}
        />

        {!scanner.hasScanned && (
          <HistoryList
            entries={history.entries}
            onDelete={history.deleteEntry}
            onClear={history.clearAll}
          />
        )}
      </div>

      {scanner.hasScanned && (
        <ResultsArea
          isScanning={scanner.isScanning}
          stats={scanner.stats}
          progress={scanner.progress}
          status={scanner.status}
          rateBanner={scanner.rateBanner}
          matches={scanner.matches}
          messages={scanner.messages}
        />
      )}
    </div>
  )
}
