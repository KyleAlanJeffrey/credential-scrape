import { useState, useEffect, useCallback } from 'react'
import type { HistoryEntry, Match } from '#/lib/types.ts'

const HISTORY_KEY = 'scan_history'
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

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [savedToken, setSavedToken] = useState('')
  const [savedUsername, setSavedUsername] = useState('')

  // Load from localStorage/cookies on mount (client only)
  useEffect(() => {
    setEntries(getHistory())
    setSavedToken(getCookie('gh_token'))
    setSavedUsername(getCookie('gh_username'))
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
    }
    const idx = history.findIndex(h => h.username.toLowerCase() === username.toLowerCase())
    if (idx !== -1) history.splice(idx, 1)
    history.unshift(entry)
    saveHistoryToStorage(history)
    setEntries([...history])
  }, [])

  const deleteEntry = useCallback((id: number) => {
    const history = getHistory().filter(h => h.id !== id)
    saveHistoryToStorage(history)
    setEntries([...history])
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY)
    setEntries([])
  }, [])

  const persistCredentials = useCallback((username: string, token: string, saveToken: boolean) => {
    if (saveToken && token) setCookie('gh_token', token)
    else setCookie('gh_token', '', -1)
    if (username) setCookie('gh_username', username)
  }, [])

  return {
    entries,
    savedToken,
    savedUsername,
    saveScan,
    deleteEntry,
    clearAll,
    persistCredentials,
  }
}
