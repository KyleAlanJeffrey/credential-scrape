import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import SearchBar from '#/components/SearchBar.tsx'
import HistoryList from '#/components/HistoryList.tsx'
import ResultsArea from '#/components/ResultsArea.tsx'
import { useScanner } from '#/hooks/useScanner.ts'
import { useHistory } from '#/hooks/useHistory.ts'
import { restoreFromHash } from '#/lib/share.ts'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const scanner = useScanner()
  const history = useHistory()
  const usernameRef = useRef<string>('')
  const tokenRef = useRef<string>('')

  // Restore shared results from URL hash
  useEffect(() => {
    restoreFromHash().then(matches => {
      if (matches) scanner.restoreResults(matches)
    }).catch(() => { /* ignore */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to history when scan completes
  useEffect(() => {
    if (!scanner.isScanning && !scanner.isPaused && scanner.hasScanned && scanner.matches.length >= 0 && scanner.stats.files > 0) {
      history.saveScan(usernameRef.current, scanner.stats.files, scanner.stats.files, scanner.matches)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanner.isScanning, scanner.isPaused])

  const handleScan = (username: string, token: string) => {
    if (!username) return
    usernameRef.current = username
    tokenRef.current = token
    history.persistCredentials(username, token)
    scanner.startScan(username, token)
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
