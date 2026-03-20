import type { Match } from './types.ts'

const PREFIX = 'scan_results_'

export function saveScanResults(id: number, matches: Match[]): boolean {
  const key = PREFIX + id
  const data = JSON.stringify(matches)
  try {
    localStorage.setItem(key, data)
    return true
  } catch {
    // Quota exceeded — evict oldest and retry
    for (let i = 0; i < 5; i++) {
      evictOldest()
      try {
        localStorage.setItem(key, data)
        return true
      } catch { /* keep trying */ }
    }
    return false
  }
}

export function loadScanResults(id: number): Match[] | null {
  const raw = localStorage.getItem(PREFIX + id)
  if (!raw) return null
  try { return JSON.parse(raw) as Match[] }
  catch { return null }
}

export function deleteScanResults(id: number): void {
  localStorage.removeItem(PREFIX + id)
}

export function clearAllScanResults(): void {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) keys.push(key)
  }
  keys.forEach(k => localStorage.removeItem(k))
}

export function hasStoredResults(id: number): boolean {
  return localStorage.getItem(PREFIX + id) !== null
}

function evictOldest(): void {
  let oldestKey: string | null = null
  let oldestId = Infinity
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      const id = Number(key.slice(PREFIX.length))
      if (id < oldestId) {
        oldestId = id
        oldestKey = key
      }
    }
  }
  if (oldestKey) localStorage.removeItem(oldestKey)
}
