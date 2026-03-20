import { $, sleep, human, esc } from './utils.js';
import { githubClient } from './github.js';
import { scanFile, SKIP_DIRS, SKIP_EXT, MAX_FILE_SIZE, SKIP_FILENAMES } from './scanner.js';
import { setStatus, clearStatus, setScanning, showResults, addMatch, addInfo, addError, hideRateBanner } from './ui.js';
import { exportJSON, shareResults, restoreFromHash } from './share.js';
import { saveScanHistory, renderHistory, restoreSavedValues, persistCredentials, initHistory } from './history.js';

let abort = null;
let isScanning = false;
let scanState = null;

function bindExportAndShare(allMatches) {
  $('#exportBtn').onclick = () => exportJSON(allMatches);
  $('#shareBtn').onclick = () => shareResults(allMatches);
}

async function startScan() {
  const token = $('#token').value.trim();
  const username = $('#username').value.trim();
  if (!username) { $('#username').focus(); return; }

  persistCredentials();

  // Resume from paused state if same user
  if (scanState && scanState.username.toLowerCase() === username.toLowerCase() && scanState.idx < scanState.jobs.length) {
    return resumeScan();
  }

  isScanning = true;
  scanState = null;
  document.body.classList.add('scanned');
  setScanning(true);

  $('#results').innerHTML = '';
  $('#stat-repos').textContent = '0';
  $('#stat-files').textContent = '0';
  $('#stat-matches').textContent = '0';
  $('#bar').style.width = '0%';
  $('#findingsCount').textContent = '';
  $('#exportBtn').classList.remove('visible');
  $('#shareBtn').classList.remove('visible');
  hideRateBanner();

  abort = new AbortController();
  const { signal } = abort;

  const client = githubClient(token, signal);
  const allMatches = [];

  try {
    setStatus('Connecting to GitHub…');

    let login = username;
    if (token) {
      const { json: me } = await client.request('/user');
      login = me.login;
      if (login.toLowerCase() !== username.toLowerCase())
        throw new Error(`Token belongs to "${login}" but you entered "${username}".`);
    } else {
      addInfo('No token — scanning public repos only (rate limit ~60 req/hr). Add a token above for private repos and higher limits.');
    }

    setStatus('Fetching repository list…');

    const repos = token
      ? (await client.paged(`/user/repos?per_page=100&affiliation=owner&visibility=all&sort=updated`))
          .filter(r => r.owner?.login?.toLowerCase() === login.toLowerCase() && !r.fork && !r.archived)
      : (await client.paged(`/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&sort=updated`))
          .filter(r => !r.fork && !r.archived);

    $('#stat-repos').textContent = human(repos.length);
    if (!repos.length) {
      setStatus('No repositories found.');
      return;
    }

    const jobs = [];

    for (const repo of repos) {
      if (signal.aborted) break;
      const branch = repo.default_branch || 'main';
      setStatus(`<span class="repo-name">${esc(repo.full_name)}</span> — reading tree…`);

      let tree;
      try {
        const { json } = await client.request(`/repos/${repo.owner.login}/${repo.name}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
        tree = json.tree || [];
      } catch (e) {
        if (e.name === 'AbortError') break;
        if (e.message.includes('409')) continue;
        addError(`${repo.full_name}: ${e.message}`);
        continue;
      }

      for (const f of tree) {
        if (f.type !== 'blob') continue;
        if (SKIP_DIRS.some(d => f.path.includes(d))) continue;
        if (typeof f.size === 'number' && f.size > MAX_FILE_SIZE) continue;
        const dot = f.path.lastIndexOf('.');
        if (dot !== -1 && SKIP_EXT.has(f.path.slice(dot).toLowerCase())) continue;
        const name = f.path.split('/').pop();
        if (SKIP_FILENAMES.has(name)) continue;
        jobs.push({ repo, branch, path: f.path, sha: f.sha });
      }
    }

    if (signal.aborted) {
      scanState = { jobs, idx: 0, done: 0, allMatches, token, username, login };
      finishStop(allMatches, jobs, 0);
      return;
    }

    scanState = { jobs, idx: 0, done: 0, allMatches, token, username, login };
    await runFileScanning(scanState);

  } catch (err) {
    if (err.name !== 'AbortError') addError(err.message || String(err));
    clearStatus();
    isScanning = false;
    setScanning(false);
    hideRateBanner();
  }
}

async function resumeScan() {
  isScanning = true;
  setScanning(true);
  hideRateBanner();
  abort = new AbortController();
  await runFileScanning(scanState);
}

async function runFileScanning(state) {
  const { jobs, allMatches } = state;
  const token = state.token;
  const { signal } = abort;
  const client = githubClient(token, signal);

  $('#progressTrack').classList.remove('indeterminate');

  const CONCURRENCY = token ? 8 : 3;
  let inFlight = 0;

  async function next() {
    if (signal.aborted || state.idx >= jobs.length) return;
    const { repo, branch, path, sha } = jobs[state.idx++];
    inFlight++;

    setStatus(`<span class="repo-name">${esc(repo.full_name)}</span> <span class="file-path">/ ${esc(path)}</span>`);

    try {
      const res = await scanFile(client, repo, branch, path, sha);
      state.done++;
      const pct = Math.round(state.done / jobs.length * 100);
      $('#stat-files').textContent = human(state.done);
      $('#bar').style.width = `${pct}%`;
      if (res?.length) {
        allMatches.push(...res);
        $('#stat-matches').textContent = human(allMatches.length);
        res.forEach(addMatch);
      }
    } catch (e) {
      if (e.name !== 'AbortError') addError(e.message);
    } finally {
      inFlight--;
      next();
    }
  }

  for (let i = 0; i < Math.min(CONCURRENCY, jobs.length - state.idx); i++) next();
  while ((state.idx < jobs.length || inFlight > 0) && !signal.aborted) await sleep(80);

  if (!signal.aborted) {
    clearStatus();
    showResults(allMatches);
    bindExportAndShare(allMatches);
    if (!allMatches.length) $('#results').innerHTML += '<div class="empty-state">No secrets found.</div>';
    saveScanHistory(state.username, state.done, jobs.length, allMatches);
    scanState = null;
  } else {
    finishStop(allMatches, jobs, state.idx);
  }

  isScanning = false;
  setScanning(false);
  hideRateBanner();
}

function finishStop(allMatches, jobs, idx) {
  const remaining = jobs.length - idx;
  setStatus(`Paused — ${human(remaining)} file${remaining !== 1 ? 's' : ''} remaining. Press Scan to continue.`);
  showResults(allMatches);
  bindExportAndShare(allMatches);

  $('#actionBtn').textContent = 'Continue';
  $('#actionBtn').classList.remove('stop-mode');
}

function stopScan() {
  if (abort) abort.abort();
}

// ── Init ──
restoreSavedValues();
initHistory();

$('#actionBtn').onclick = e => {
  e.preventDefault();
  isScanning ? stopScan() : startScan();
};

$('#username').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !isScanning) startScan();
});

restoreFromHash();
