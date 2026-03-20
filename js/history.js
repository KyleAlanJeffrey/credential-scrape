import { $, esc, human } from './utils.js';

const HISTORY_KEY = 'scan_history';
const MAX_HISTORY = 20;

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function saveScanHistory(username, filesScanned, totalFiles, matches) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    username,
    date: new Date().toISOString(),
    filesScanned,
    totalFiles,
    findings: matches.length,
    repos: new Set(matches.map(m => m.repo)).size,
  };
  const idx = history.findIndex(h => h.username.toLowerCase() === username.toLowerCase());
  if (idx !== -1) history.splice(idx, 1);
  history.unshift(entry);
  saveHistory(history);
  renderHistory();
}

function deleteHistoryEntry(id) {
  const history = getHistory().filter(h => h.id !== id);
  saveHistory(history);
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function formatRelative(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function renderHistory() {
  const history = getHistory();
  const list = $('#historyList');
  const section = $('#historySection');

  if (!history.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  list.innerHTML = history.map(h => {
    const date = new Date(h.date);
    const relative = formatRelative(date);
    return `<li class="history-item" data-user="${esc(h.username)}">
      <span class="history-user">${esc(h.username)}</span>
      <span class="history-meta">
        <span><strong>${human(h.findings)}</strong> finding${h.findings !== 1 ? 's' : ''}</span>
        <span><strong>${human(h.filesScanned)}</strong> files</span>
      </span>
      <span class="history-date">${esc(relative)}</span>
      <button class="history-delete" data-id="${h.id}" title="Remove">&times;</button>
    </li>`;
  }).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.history-delete')) return;
      $('#username').value = el.dataset.user;
      $('#username').focus();
    });
  });

  list.querySelectorAll('.history-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteHistoryEntry(Number(btn.dataset.id));
    });
  });
}

// Cookie helpers
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export function restoreSavedValues() {
  const savedToken = getCookie('gh_token');
  const savedUser = getCookie('gh_username');
  if (savedToken) $('#token').value = savedToken;
  if (savedUser) $('#username').value = savedUser;
}

export function persistCredentials() {
  const token = $('#token').value.trim();
  const username = $('#username').value.trim();
  if (token) setCookie('gh_token', token); else setCookie('gh_token', '', -1);
  if (username) setCookie('gh_username', username);
}

export function initHistory() {
  $('#historyClear').onclick = clearHistory;
  renderHistory();
}
