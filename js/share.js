import { $, human } from './utils.js';
import { addMatch, addError } from './ui.js';

export function exportJSON(matches) {
  const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), matches }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scan-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function compressData(str) {
  const enc = new TextEncoder().encode(str);
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(enc);
  writer.close();
  const chunks = [];
  const reader = cs.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buf = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function decompressData(b64) {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(u8);
  writer.close();
  const chunks = [];
  const reader = ds.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buf = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return new TextDecoder().decode(buf);
}

export async function shareResults(matches) {
  const data = JSON.stringify(matches);
  const compressed = await compressData(data);
  const url = location.origin + location.pathname + '#results=' + compressed;
  await navigator.clipboard.writeText(url);
  const btn = $('#shareBtn');
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'Share Link'; btn.classList.remove('copied'); }, 2000);
}

export async function restoreFromHash() {
  const hash = location.hash;
  if (!hash.startsWith('#results=')) return;
  const compressed = hash.slice('#results='.length);
  try {
    const matches = JSON.parse(await decompressData(compressed));
    document.body.classList.add('scanned');
    $('#stat-repos').textContent = human(new Set(matches.map(m => m.repo)).size);
    $('#stat-files').textContent = human(new Set(matches.map(m => m.repo + '/' + m.path)).size);
    $('#stat-matches').textContent = human(matches.length);
    $('#bar').style.width = '100%';
    $('#findingsCount').textContent = `${matches.length} finding${matches.length !== 1 ? 's' : ''}`;
    matches.forEach(addMatch);
    $('#exportBtn').classList.add('visible');
    $('#exportBtn').onclick = () => exportJSON(matches);
    $('#shareBtn').classList.add('visible');
    $('#shareBtn').onclick = () => shareResults(matches);
  } catch (e) {
    addError('Failed to restore shared results: ' + e.message);
  }
}
