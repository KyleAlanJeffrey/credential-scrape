import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onScan: (username: string, token: string, saveToken: boolean) => void
  onStop: () => void
  isScanning: boolean
  isPaused: boolean
  savedUsername: string
  savedToken: string
}

export default function SearchBar({ onScan, onStop, isScanning, isPaused, savedUsername, savedToken }: SearchBarProps) {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [saveToken, setSaveToken] = useState(false)
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (savedUsername) setUsername(savedUsername)
    if (savedToken) {
      setToken(savedToken)
      setSaveToken(true)
    }
  }, [savedUsername, savedToken])

  useEffect(() => {
    if (!showTokenInfo) return
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowTokenInfo(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showTokenInfo])

  const handleSubmit = () => {
    if (isScanning) {
      onStop()
    } else {
      onScan(username.trim(), token.trim(), saveToken)
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
        <label className="token-remember">
          <input
            type="checkbox"
            checked={saveToken}
            onChange={e => setSaveToken(e.target.checked)}
          />
          <span className="token-remember-check" />
          <span className="token-remember-label">Remember</span>
        </label>
        <div className="token-info-wrap">
          <button
            ref={buttonRef}
            className="token-info-btn"
            onClick={() => setShowTokenInfo(v => !v)}
            aria-label="How to get a token"
          >
            ?
          </button>
          {showTokenInfo && (
            <div ref={popoverRef} className="token-info-popover">
              <div className="token-info-title">Getting a GitHub Token</div>
              <ol className="token-info-steps">
                <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">github.com/settings/tokens</a></li>
                <li>Click <strong>Generate new token</strong> (classic)</li>
                <li>Give it a name and select the scopes below</li>
                <li>Click <strong>Generate token</strong> and paste it above</li>
              </ol>
              <div className="token-info-perms">
                <div className="token-info-perms-title">Required scopes</div>
                <div className="token-info-perm"><code>public_repo</code> <span>Access public repo contents (higher rate limit)</span></div>
                <div className="token-info-perms-title" style={{ marginTop: 6 }}>Optional scopes</div>
                <div className="token-info-perm"><code>repo</code> <span>Include private repositories in scan</span></div>
                <div className="token-info-perm"><code>read:org</code> <span>List repos from organizations you belong to</span></div>
              </div>
              <div className="token-info-note">
                A token is optional but gives access to private repos and raises the rate limit from 60 to 5,000 requests/hour. The token is stored locally in a browser cookie and is never sent anywhere except <code>api.github.com</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
