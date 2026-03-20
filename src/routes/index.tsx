import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import SearchBar, { type ScanMode } from '#/components/SearchBar.tsx'
import HistoryList from '#/components/HistoryList.tsx'
import ResultsArea from '#/components/ResultsArea.tsx'
import { useScanner } from '#/hooks/useScanner.ts'
import { useHistory } from '#/hooks/useHistory.ts'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const scanner = useScanner()
  const history = useHistory()
  const navigate = useNavigate()
  const usernameRef = useRef<string>('')
  const tokenRef = useRef<string>('')

  // Redirect old-format shared URLs to /results/shared
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#results=')) {
      navigate({ to: '/results/$id', params: { id: 'shared' }, hash: window.location.hash })
    }
  }, [navigate])

  // Save to history when scan completes
  useEffect(() => {
    if (!scanner.isScanning && !scanner.isPaused && scanner.hasScanned && scanner.stats.files > 0) {
      history.saveScan(usernameRef.current, scanner.stats.files, scanner.stats.files, scanner.matches)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanner.isScanning, scanner.isPaused])

  const handleScan = (target: string, token: string, saveToken: boolean, mode: ScanMode) => {
    if (!target) return
    usernameRef.current = target
    tokenRef.current = token
    history.persistCredentials(target, token, saveToken)
    scanner.startScan(target, token, mode)
  }

  const handleHistorySelect = (username: string) => {
    usernameRef.current = username
  }

  return (
    <div className="page">
      <div className="hero">
        <h1 className="logo">Secret Scanner</h1>
        <p className="tagline">Find leaked credentials across GitHub repositories.</p>

        <SearchBar
          onScan={handleScan}
          onStop={scanner.stopScan}
          isScanning={scanner.isScanning}
          isPaused={scanner.isPaused}
          savedUsername={history.savedUsername}
          savedToken={history.savedToken}
          savedRemember={history.rememberToken}
        />
      </div>

      {!scanner.hasScanned && (
        <HistoryList
          entries={history.entries}
          onSelect={handleHistorySelect}
          onDelete={history.deleteEntry}
          onClear={history.clearAll}
        />
      )}

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
