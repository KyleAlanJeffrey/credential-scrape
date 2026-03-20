export const $ = (s) => document.querySelector(s);
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function human(n) {
  return Number(n || 0).toLocaleString();
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
