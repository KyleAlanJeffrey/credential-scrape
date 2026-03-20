import type { Pattern, CompiledPattern } from './types.ts'

export const PATTERNS: Pattern[] = [
  // ── Cloud Providers ──
  { name: 'AWS Access Key ID',           regex: 'AKIA[0-9A-Z]{16}',                                                            flags: 'g',  severity: 'high'     },
  { name: 'AWS Secret Access Key',       regex: 'aws(.{0,20})?(secret|access).{0,20}["\'][0-9a-zA-Z/+]{40}["\']',             flags: 'gi', severity: 'high'     },
  { name: 'Google API Key',              regex: 'AIza[0-9A-Za-z_\\-]{35}',                                                    flags: 'g',  severity: 'high'     },
  { name: 'Google OAuth Client Secret',  regex: 'GOCSPX-[A-Za-z0-9_\\-]{28}',                                                flags: 'g',  severity: 'high'     },
  { name: 'GCP Service Account Key',     regex: '"type"\\s*:\\s*"service_account"',                                            flags: 'g',  severity: 'critical' },
  { name: 'Azure Storage Account Key',   regex: 'DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{88}', flags: 'g', severity: 'critical' },
  { name: 'Azure AD Client Secret',      regex: 'azure(.{0,20})?(client_secret|clientSecret).{0,10}["\'][0-9a-zA-Z~._\\-]{34,}["\']', flags: 'gi', severity: 'high' },

  // ── AI / LLM ──
  { name: 'OpenAI API Key',              regex: 'sk-[A-Za-z0-9]{48}',                                                         flags: 'g',  severity: 'high'     },
  { name: 'OpenAI Project Key',          regex: 'sk-proj-[A-Za-z0-9_\\-]{40,}',                                               flags: 'g',  severity: 'high'     },
  { name: 'Anthropic API Key',           regex: 'sk-ant-[A-Za-z0-9_\\-]{40,}',                                                flags: 'g',  severity: 'high'     },

  // ── Source Control ──
  { name: 'GitHub Token (classic)',      regex: '(?:ghp|gho|ghu|ghs|ghr)_[0-9A-Za-z]{36}',                                    flags: 'g',  severity: 'high'     },
  { name: 'GitHub Token (fine-grained)', regex: 'github_pat_[0-9A-Za-z_]{50,255}',                                            flags: 'g',  severity: 'high'     },
  { name: 'GitLab Token',               regex: 'glpat-[0-9A-Za-z_\\-]{20,}',                                                 flags: 'g',  severity: 'high'     },
  { name: 'Bitbucket App Password',      regex: 'ATBB[A-Za-z0-9]{32,}',                                                      flags: 'g',  severity: 'high'     },

  // ── Messaging / Collaboration ──
  { name: 'Slack Token',                 regex: 'xox[baprs]-[0-9A-Za-z-]{10,48}',                                             flags: 'g',  severity: 'high'     },
  { name: 'Slack Webhook',               regex: 'https://hooks\\.slack\\.com/services/[A-Za-z0-9/]{20,}',                     flags: 'g',  severity: 'high'     },
  { name: 'Discord Bot Token',           regex: '[MN][A-Za-z0-9]{23,}\\.[A-Za-z0-9_-]{6}\\.[A-Za-z0-9_-]{27,}',             flags: 'g',  severity: 'high'     },
  { name: 'Discord Webhook',             regex: 'https://discord(?:app)?\\.com/api/webhooks/[0-9]+/[A-Za-z0-9_\\-]+',        flags: 'g',  severity: 'medium'   },
  { name: 'Telegram Bot Token',          regex: '[0-9]{8,10}:[A-Za-z0-9_-]{35}',                                              flags: 'g',  severity: 'high'     },

  // ── Payments ──
  { name: 'Stripe Secret Key',           regex: 'sk_live_[0-9a-zA-Z]{24,}',                                                   flags: 'g',  severity: 'critical' },
  { name: 'Stripe Publishable Key',      regex: 'pk_live_[0-9a-zA-Z]{24,}',                                                   flags: 'g',  severity: 'medium'   },
  { name: 'Stripe Restricted Key',       regex: 'rk_live_[0-9a-zA-Z]{24,}',                                                   flags: 'g',  severity: 'high'     },
  { name: 'Square Access Token',         regex: 'sq0atp-[0-9A-Za-z_\\-]{22,}',                                                flags: 'g',  severity: 'high'     },
  { name: 'Square OAuth Secret',         regex: 'sq0csp-[0-9A-Za-z_\\-]{40,}',                                                flags: 'g',  severity: 'high'     },
  { name: 'PayPal Client Secret',        regex: 'paypal(.{0,20})?(secret|client).{0,10}["\'][A-Za-z0-9_\\-]{30,}["\']',      flags: 'gi', severity: 'high'     },

  // ── E-Commerce ──
  { name: 'Shopify Access Token',        regex: 'shpat_[A-Fa-f0-9]{32}',                                                      flags: 'g',  severity: 'high'     },
  { name: 'Shopify Shared Secret',       regex: 'shpss_[A-Fa-f0-9]{32}',                                                      flags: 'g',  severity: 'high'     },
  { name: 'Shopify Custom App Token',    regex: 'shpca_[A-Fa-f0-9]{32}',                                                      flags: 'g',  severity: 'high'     },
  { name: 'Shopify Private App Token',   regex: 'shppa_[A-Fa-f0-9]{32}',                                                      flags: 'g',  severity: 'high'     },

  // ── Email / Communication ──
  { name: 'SendGrid API Key',            regex: 'SG\\.[A-Za-z0-9_\\-]{22}\\.[A-Za-z0-9_\\-]{43}',                            flags: 'g',  severity: 'high'     },
  { name: 'Mailgun API Key',             regex: 'key-[0-9a-zA-Z]{32}',                                                        flags: 'g',  severity: 'high'     },
  { name: 'Mailchimp API Key',           regex: '[0-9a-f]{32}-us[0-9]{1,2}',                                                  flags: 'g',  severity: 'high'     },
  { name: 'Twilio API Key',              regex: 'SK[0-9a-fA-F]{32}',                                                          flags: 'g',  severity: 'high'     },
  { name: 'Twilio Account SID',          regex: 'AC[0-9a-fA-F]{32}',                                                          flags: 'g',  severity: 'medium'   },

  // ── Infrastructure / DevOps ──
  { name: 'Heroku API Key',              regex: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', flags: 'g', severity: 'medium' },
  { name: 'Datadog API Key',             regex: 'dd(.{0,10})?(api|app).{0,10}["\'][0-9a-f]{32,40}["\']',                      flags: 'gi', severity: 'high'     },
  { name: 'npm Token',                   regex: 'npm_[A-Za-z0-9]{36}',                                                        flags: 'g',  severity: 'high'     },
  { name: 'PyPI Token',                  regex: 'pypi-[A-Za-z0-9_\\-]{50,}',                                                  flags: 'g',  severity: 'high'     },
  { name: 'NuGet API Key',               regex: 'oy2[a-z0-9]{43}',                                                            flags: 'g',  severity: 'high'     },
  { name: 'Docker Hub Token',            regex: 'dckr_pat_[A-Za-z0-9_\\-]{20,}',                                              flags: 'g',  severity: 'high'     },

  // ── Databases ──
  { name: 'Database Connection String',  regex: '(?:mongodb(?:\\+srv)?|postgres(?:ql)?|mysql|redis|amqp)://[^\\s"\']{10,}',   flags: 'gi', severity: 'critical' },

  // ── Crypto / Keys ──
  { name: 'Private Key',                 regex: '-----BEGIN (?:EC|RSA|OPENSSH|DSA|PGP) PRIVATE KEY-----',                     flags: 'g',  severity: 'critical' },

  // ── Generic ──
  { name: 'Generic Secret Assignment',   regex: '\\b(password|passwd|pwd|secret|token|api_key|apikey|api_secret|auth_token|access_token|secret_key)\\b\\s*[:=]\\s*["\'][^"\'\\n]{6,}["\']', flags: 'gi', severity: 'medium' },
  { name: 'Generic Bearer Token',        regex: '(?:Authorization|authorization).{0,10}Bearer\\s+[A-Za-z0-9_\\-\\.]{20,}',   flags: 'g',  severity: 'medium'   },
  { name: 'JWT',                         regex: 'eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',          flags: 'g',  severity: 'medium'   },
]

export const compiled: CompiledPattern[] = PATTERNS.map(p => ({
  ...p,
  re: new RegExp(p.regex, p.flags),
}))
