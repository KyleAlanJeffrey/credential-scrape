import { useState, useEffect, useRef } from 'react'

export type ScanMode = 'account' | 'repo'

interface SearchBarProps {
  onScan: (target: string, token: string, saveToken: boolean, mode: ScanMode) => void
  onStop: () => void
  isScanning: boolean
  isPaused: boolean
  savedUsername: string
  savedToken: string
  savedRemember: boolean
}

export default function SearchBar({ onScan, onStop, isScanning, isPaused, savedUsername, savedToken, savedRemember }: SearchBarProps) {
  const [mode, setMode] = useState<ScanMode>('account')
  const [username, setUsername] = useState('')
  const [repoInput, setRepoInput] = useState('')
  const [token, setToken] = useState('')
  const [saveToken, setSaveToken] = useState(false)
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (savedUsername) setUsername(savedUsername)
    if (savedToken) setToken(savedToken)
    setSaveToken(savedRemember)
  }, [savedUsername, savedToken, savedRemember])

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

  const target = mode === 'account' ? username : repoInput
  const setTarget = mode === 'account' ? setUsername : setRepoInput

  const handleSubmit = () => {
    if (isScanning) {
      onStop()
    } else {
      onScan(target.trim(), token.trim(), saveToken, mode)
    }
  }

  const buttonText = isScanning ? 'Stop' : isPaused ? 'Continue' : 'Scan'
  const placeholder = mode === 'account'
    ? 'GitHub username'
    : 'owner/repo or GitHub URL'

  // Parse repo input for detection badge
  const parsedRepo = (() => {
    if (mode !== 'repo' || !repoInput.trim()) return null
    try {
      const input = repoInput.trim()
      const url = (() => { try { return new URL(input) } catch { return null } })()
      if (url && (url.hostname === 'github.com' || url.hostname === 'www.github.com')) {
        const parts = url.pathname.split('/').filter(Boolean)
        if (parts.length >= 2) return { owner: parts[0]!, repo: parts[1]!, fromUrl: true }
      }
      const slash = input.indexOf('/')
      if (slash > 0 && slash < input.length - 1) {
        return { owner: input.slice(0, slash), repo: input.slice(slash + 1), fromUrl: false }
      }
    } catch { /* ignore */ }
    return null
  })()

  return (
    <>
      <div className="scan-mode-tabs">
        <button
          className={`scan-mode-tab${mode === 'account' ? ' active' : ''}`}
          onClick={() => setMode('account')}
        >
          Account
        </button>
        <button
          className={`scan-mode-tab${mode === 'repo' ? ' active' : ''}`}
          onClick={() => setMode('repo')}
        >
          Repository
        </button>
      </div>

      <div className="search-box">
        <div className="search-row">
          <input
            id="username"
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            value={target}
            onChange={e => setTarget(e.target.value)}
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
        {mode === 'repo' && parsedRepo && (
          <span className="repo-detected" title={`${parsedRepo.owner}/${parsedRepo.repo}`}>&#10003;</span>
        )}
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
