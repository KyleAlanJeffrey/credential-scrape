import type { Match } from './types.ts'

export function exportJSON(matches: Match[]) {
  const blob = new Blob(
    [JSON.stringify({ generatedAt: new Date().toISOString(), matches }, null, 2)],
    { type: 'application/json' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scan-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function compressData(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str)
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(enc)
  writer.close()
  const chunks: Uint8Array[] = []
  const reader = cs.readable.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const buf = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0))
  let off = 0
  for (const c of chunks) { buf.set(c, off); off += c.length }
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function decompressData(b64: string): Promise<string> {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
  const u8 = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  writer.write(u8)
  writer.close()
  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const buf = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0))
  let off = 0
  for (const c of chunks) { buf.set(c, off); off += c.length }
  return new TextDecoder().decode(buf)
}

export async function createShareUrl(matches: Match[]): Promise<string> {
  const data = JSON.stringify(matches)
  const compressed = await compressData(data)
  return location.origin + '/results/shared#results=' + compressed
}

export async function restoreFromHash(): Promise<Match[] | null> {
  const hash = location.hash
  if (!hash.startsWith('#results=')) return null
  const compressed = hash.slice('#results='.length)
  return JSON.parse(await decompressData(compressed)) as Match[]
}
