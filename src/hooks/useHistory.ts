import { useState, useEffect, useCallback } from 'react'
import type { HistoryEntry, Match } from '#/lib/types.ts'
import { saveScanResults, deleteScanResults, clearAllScanResults } from '#/lib/scanStorage.ts'

const HISTORY_KEY = 'scan_history'
const REMEMBER_KEY = 'gh_remember_token'
const MAX_HISTORY = 20

function getHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function saveHistoryToStorage(history: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

function setCookie(name: string, value: string, days = 365) {
  const d = new Date()
  d.setTime(d.getTime() + days * 86400000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]!) : ''
}

export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function getHistoryEntry(id: number): HistoryEntry | null {
  const history = getHistory()
  return history.find(h => h.id === id) ?? null
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [savedToken, setSavedToken] = useState('')
  const [savedUsername, setSavedUsername] = useState('')
  const [rememberToken, setRememberToken] = useState(false)

  // Load from localStorage/cookies on mount (client only)
  useEffect(() => {
    setEntries(getHistory())
    setSavedToken(getCookie('gh_token'))
    setSavedUsername(getCookie('gh_username'))
    setRememberToken(localStorage.getItem(REMEMBER_KEY) === 'true')
  }, [])

  const saveScan = useCallback((username: string, filesScanned: number, totalFiles: number, matches: Match[]) => {
    const history = getHistory()
    const entry: HistoryEntry = {
      id: Date.now(),
      username,
      date: new Date().toISOString(),
      filesScanned,
      totalFiles,
      findings: matches.length,
      repos: new Set(matches.map(m => m.repo)).size,
      hasResults: true,
    }

    // Remove previous entry for same user (and its stored results)
    const idx = history.findIndex(h => h.username.toLowerCase() === username.toLowerCase())
    if (idx !== -1) {
      deleteScanResults(history[idx]!.id)
      history.splice(idx, 1)
    }

    // Store full results
    const stored = saveScanResults(entry.id, matches)
    if (!stored) entry.hasResults = false

    history.unshift(entry)
    saveHistoryToStorage(history)
    setEntries([...history])
  }, [])

  const deleteEntry = useCallback((id: number) => {
    deleteScanResults(id)
    const history = getHistory().filter(h => h.id !== id)
    saveHistoryToStorage(history)
    setEntries([...history])
  }, [])

  const clearAll = useCallback(() => {
    clearAllScanResults()
    localStorage.removeItem(HISTORY_KEY)
    setEntries([])
  }, [])

  const persistCredentials = useCallback((username: string, token: string, saveToken: boolean) => {
    localStorage.setItem(REMEMBER_KEY, String(saveToken))
    setRememberToken(saveToken)
    if (saveToken && token) setCookie('gh_token', token)
    else setCookie('gh_token', '', -1)
    if (username) setCookie('gh_username', username)
  }, [])

  return {
    entries,
    savedToken,
    savedUsername,
    rememberToken,
    saveScan,
    deleteEntry,
    clearAll,
    persistCredentials,
  }
}
