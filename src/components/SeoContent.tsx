import { Link } from "@tanstack/react-router";
import { PATTERNS } from "#/lib/patterns.ts";

export default function SeoContent() {
  const categories = [
    { name: "Cloud Providers", examples: "AWS Access Keys, Google API Keys, Azure Storage Keys, GCP Service Account Keys" },
    { name: "AI & LLM", examples: "OpenAI API Keys, Anthropic Keys, Project-scoped Keys" },
    { name: "Payment Systems", examples: "Stripe Secret Keys, Square Tokens, PayPal Client Secrets, Shopify Tokens" },
    { name: "Source Control", examples: "GitHub Tokens, GitLab Tokens, Bitbucket App Passwords" },
    { name: "Messaging", examples: "Slack Tokens, Discord Bot Tokens, Telegram Bot Tokens, Webhooks" },
    { name: "DevOps & Infrastructure", examples: "npm Tokens, PyPI Tokens, Docker Hub Tokens, Database Connection Strings" },
  ];

  return (
    <section className="seo-content">
      <div className="seo-content-inner">
        <h2>Free GitHub Secret Scanner</h2>
        <p>
          Secret Scanner is a free, open-source tool that scans GitHub repositories
          for leaked credentials, API keys, tokens, passwords, and other sensitive
          secrets. Enter a GitHub username to scan all their public repositories, or
          paste a repository URL to scan a single project.
        </p>

        <h3>How It Works</h3>
        <p>
          Secret Scanner uses {PATTERNS.length} regex-based detection rules to find
          leaked credentials in source code. It reads every file in each repository
          through the GitHub API, skipping binary files, lock files, and build
          artifacts. All scanning happens entirely in your browser — no code or
          credentials are ever sent to our servers.
        </p>

        <h3>What We Detect</h3>
        <div className="seo-categories">
          {categories.map(cat => (
            <div key={cat.name} className="seo-category">
              <h4>{cat.name}</h4>
              <p>{cat.examples}</p>
            </div>
          ))}
        </div>
        <p>
          <Link to="/patterns">View all {PATTERNS.length} detection rules</Link> with
          full descriptions, risk assessments, and remediation guidance.
        </p>

        <h3>Why Scan for Leaked Secrets?</h3>
        <p>
          Accidentally committed credentials are one of the most common security
          vulnerabilities in software development. A single leaked AWS key can lead
          to unauthorized cloud resource usage, data breaches, or account takeover.
          GitHub&apos;s public repositories are continuously scanned by attackers looking
          for exposed API keys and tokens. Regular scanning helps you find and
          revoke compromised credentials before they can be exploited.
        </p>

        <h3>Features</h3>
        <ul>
          <li><strong>Account-wide scanning</strong> — scan all repositories for a GitHub user</li>
          <li><strong>Single repository scanning</strong> — paste a repo URL or enter owner/repo</li>
          <li><strong>Severity classification</strong> — findings rated as critical, high, or medium</li>
          <li><strong>Remediation guidance</strong> — each finding includes risk assessment and steps to fix</li>
          <li><strong>Export &amp; share</strong> — download results as JSON or share via compressed URL</li>
          <li><strong>Scan history</strong> — previous scans saved locally for quick reference</li>
          <li><strong>Privacy first</strong> — runs entirely client-side, no data leaves your browser</li>
          <li><strong>Optional GitHub token</strong> — scan private repos with a personal access token</li>
        </ul>
      </div>
    </section>
  );
}
