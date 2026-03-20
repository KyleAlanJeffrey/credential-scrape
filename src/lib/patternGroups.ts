import type { Pattern } from './types.ts'

const CATEGORY_PREFIXES: [string[], string][] = [
  [['AWS', 'Google', 'GCP', 'Azure'], 'Cloud Providers'],
  [['OpenAI', 'Anthropic'], 'AI / LLM'],
  [['GitHub', 'GitLab', 'Bitbucket'], 'Source Control'],
  [['Slack', 'Discord', 'Telegram'], 'Messaging'],
  [['Stripe', 'Square', 'PayPal'], 'Payments'],
  [['Shopify'], 'E-Commerce'],
  [['SendGrid', 'Mailgun', 'Mailchimp', 'Twilio'], 'Email / Comms'],
  [['Heroku', 'Datadog', 'npm', 'PyPI', 'NuGet', 'Docker'], 'DevOps / Infra'],
  [['Database'], 'Databases'],
  [['Private Key'], 'Crypto / Keys'],
  [['Generic', 'JWT'], 'Generic'],
]

function getCategory(name: string): string {
  for (const [prefixes, category] of CATEGORY_PREFIXES) {
    if (prefixes.some(k => name.startsWith(k) || name === k)) return category
  }
  return 'Other'
}

export function groupPatterns(patterns: Pattern[]): [string, Pattern[]][] {
  const groups: Record<string, Pattern[]> = {}
  for (const p of patterns) {
    const cat = getCategory(p.name)
    if (!groups[cat]) groups[cat] = []
    groups[cat]!.push(p)
  }
  return Object.entries(groups)
}
