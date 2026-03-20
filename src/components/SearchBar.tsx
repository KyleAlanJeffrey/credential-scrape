import { useState, useEffect } from 'react'

interface SearchBarProps {
  onScan: (username: string, token: string) => void
  onStop: () => void
  isScanning: boolean
  isPaused: boolean
  savedUsername: string
  savedToken: string
}

export default function SearchBar({ onScan, onStop, isScanning, isPaused, savedUsername, savedToken }: SearchBarProps) {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    if (savedUsername) setUsername(savedUsername)
    if (savedToken) setToken(savedToken)
  }, [savedUsername, savedToken])

  const handleSubmit = () => {
    if (isScanning) {
      onStop()
    } else {
      onScan(username.trim(), token.trim())
    }
  }

  const buttonText = isScanning ? 'Stop' : isPaused ? 'Continue' : 'Scan'

  return (
    <>
      <div className="search-box">
        <div className="search-row">
          <input
            id="username"
            type="text"
            placeholder="GitHub username"
            autoComplete="off"
            spellCheck={false}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isScanning) handleSubmit() }}
          />
          <button
            id="actionBtn"
            className={isScanning ? 'stop-mode' : ''}
            onClick={handleSubmit}
          >
            {buttonText}
          </button>
        </div>
      </div>

      <div className="token-row">
        <span className="token-label">Token</span>
        <input
          id="token"
          type="password"
          placeholder="ghp_... — optional, for private repos & higher rate limits"
          autoComplete="off"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
      </div>
    </>
  )
}
