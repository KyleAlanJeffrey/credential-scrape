import { $, esc, human } from './utils.js';

let rateLimitInterval = null;

export function setStatus(html, rateLimited = false) {
  const el = $('#scanStatus');
  el.classList.add('visible');
  $('#scanStatusText').innerHTML = html;
  $('#pulseDot').className = 'pulse-dot' + (rateLimited ? ' rate-limited' : '');
}

export function clearStatus() {
  $('#scanStatus').classList.remove('visible');
}

export function showRateBanner(msg) {
  const b = $('#rateBanner');
  $('#rateBannerMsg').innerHTML = msg;
  b.classList.add('visible');
}

export function hideRateBanner() {
  $('#rateBanner').classList.remove('visible');
  if (rateLimitInterval) { clearInterval(rateLimitInterval); rateLimitInterval = null; }
}

export function setScanning(active) {
  const btn = $('#actionBtn');
  if (active) {
    btn.textContent = 'Stop';
    btn.classList.add('stop-mode');
  } else {
    btn.textContent = 'Scan';
    btn.classList.remove('stop-mode');
  }
  $('#progressTrack').classList.toggle('indeterminate', active && $('#bar').style.width === '0%');
  $('#bar').classList.toggle('active', active);
}

export function addMatch(m) {
  const el = document.createElement('div');
  el.className = 'match';
  const sev = m.severity === 'critical' ? 'critical' : m.severity === 'high' ? 'high' : 'medium';
  el.innerHTML = `
    <div class="match-top">
      <span class="badge ${sev}">${esc(m.severity)}</span>
      <span class="match-pattern">${esc(m.pattern)}</span>
      <a class="match-link" href="${m.html_url}" target="_blank" rel="noopener">${esc(m.repo)} / ${esc(m.path)} :${m.line}</a>
    </div>
    <pre><code>${highlight(m.snippet, m.match)}</code></pre>`;
  $('#results').appendChild(el);
}

export function addInfo(msg) {
  const el = document.createElement('div');
  el.className = 'info-card';
  el.textContent = msg;
  $('#results').appendChild(el);
}

export function addError(msg) {
  const el = document.createElement('div');
  el.className = 'error-card';
  el.textContent = msg;
  $('#results').appendChild(el);
}

function highlight(snippet, match) {
  return esc(snippet).replace(esc(match), `<mark>${esc(match)}</mark>`);
}

export function showResults(allMatches) {
  const n = allMatches.length;
  $('#findingsCount').textContent = n ? `${n} finding${n !== 1 ? 's' : ''}` : '';
  if (n) {
    $('#exportBtn').classList.add('visible');
    $('#shareBtn').classList.add('visible');
  }
}
