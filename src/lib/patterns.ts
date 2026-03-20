import type { Pattern, CompiledPattern } from './types.ts'

export const PATTERNS: Pattern[] = [
  { name: 'AWS Access Key ID',           regex: 'AKIA[0-9A-Z]{16}',                                                            flags: 'g',  severity: 'high'     },
  { name: 'AWS Secret Access Key',       regex: 'aws(.{0,20})?(secret|access).{0,20}["\'][0-9a-zA-Z/+]{40}["\']',             flags: 'gi', severity: 'high'     },
  { name: 'GitHub Token (classic)',      regex: '(?:ghp|gho|ghu|ghs|ghr)_[0-9A-Za-z]{36}',                                    flags: 'g',  severity: 'high'     },
  { name: 'GitHub Token (fine-grained)', regex: 'github_pat_[0-9A-Za-z_]{50,255}',                                            flags: 'g',  severity: 'high'     },
  { name: 'Google API Key',              regex: 'AIza[0-9A-Za-z_\\-]{35}',                                                    flags: 'g',  severity: 'high'     },
  { name: 'Slack Token',                 regex: 'xox[baprs]-[0-9A-Za-z-]{10,48}',                                             flags: 'g',  severity: 'high'     },
  { name: 'Slack Webhook',               regex: 'https://hooks\\.slack\\.com/services/[A-Za-z0-9/]{20,}',                     flags: 'g',  severity: 'high'     },
  { name: 'Private Key',                 regex: '-----BEGIN (?:EC|RSA|OPENSSH|DSA) PRIVATE KEY-----',                         flags: 'g',  severity: 'critical' },
  { name: 'Generic Secret Assignment',   regex: '\\b(password|passwd|pwd|secret|token)\\b\\s*[:=]\\s*["\'][^"\'\\n]{6,}["\']', flags: 'gi', severity: 'medium'   },
  { name: 'JWT',                         regex: 'eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',          flags: 'g',  severity: 'medium'   },
]

export const compiled: CompiledPattern[] = PATTERNS.map(p => ({
  ...p,
  re: new RegExp(p.regex, p.flags),
}))
