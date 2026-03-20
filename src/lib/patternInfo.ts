export const PATTERN_DESCRIPTIONS: Record<string, { description: string; risk: string; action: string }> = {
  // ── Cloud Providers ──
  'AWS Access Key ID': {
    description: 'An AWS access key identifier that can be used with a secret key to authenticate API requests.',
    risk: 'Grants access to AWS services. Attackers can provision resources, access data, or escalate privileges.',
    action: 'Rotate the key immediately in the AWS IAM console and audit CloudTrail logs for unauthorized usage.',
  },
  'AWS Secret Access Key': {
    description: 'An AWS secret key paired with an access key ID for authenticating API calls.',
    risk: 'Full API access to the associated AWS account. Can lead to data exfiltration or resource abuse.',
    action: 'Deactivate and delete the key pair in IAM, then rotate all affected credentials.',
  },
  'Google API Key': {
    description: 'A Google Cloud API key used to authenticate requests to Google services (Maps, Firebase, etc.).',
    risk: 'Can incur billing charges or access restricted APIs depending on key restrictions.',
    action: 'Delete the key in Google Cloud Console and create a new one with proper API and referrer restrictions.',
  },
  'Google OAuth Client Secret': {
    description: 'A Google OAuth 2.0 client secret used for server-side authentication flows.',
    risk: 'Can be used to impersonate your app and gain access to user data via OAuth consent.',
    action: 'Reset the client secret in the Google Cloud Console and update your application configuration.',
  },
  'GCP Service Account Key': {
    description: 'A Google Cloud service account JSON key file that grants programmatic access to GCP resources.',
    risk: 'Full access to GCP resources the service account is authorized for. Often has broad permissions.',
    action: 'Delete the key in GCP IAM, create a new one, and prefer Workload Identity Federation over key files.',
  },
  'Azure Storage Account Key': {
    description: 'An Azure Storage account connection string with embedded access key for blob, queue, and table storage.',
    risk: 'Full read/write access to all data in the storage account including blobs, queues, and tables.',
    action: 'Rotate the storage account key in the Azure portal and update all consuming applications.',
  },
  'Azure AD Client Secret': {
    description: 'An Azure Active Directory app registration client secret used for OAuth authentication.',
    risk: 'Can authenticate as the application and access any resources the app registration is authorized for.',
    action: 'Delete the client secret in Azure AD, create a new one, and prefer managed identities where possible.',
  },

  // ── AI / LLM ──
  'OpenAI API Key': {
    description: 'An OpenAI API key (sk-...) that grants access to GPT models, DALL-E, embeddings, and other OpenAI services.',
    risk: 'Attackers can run inference at your expense, potentially incurring significant API charges.',
    action: 'Revoke the key at platform.openai.com/api-keys and generate a new one. Review usage logs for abuse.',
  },
  'OpenAI Project Key': {
    description: 'An OpenAI project-scoped API key (sk-proj-...) with access limited to a specific project.',
    risk: 'Can access all models and resources within the scoped project, incurring usage costs.',
    action: 'Revoke at platform.openai.com/api-keys, regenerate, and ensure project-level billing limits are set.',
  },
  'Anthropic API Key': {
    description: 'An Anthropic API key (sk-ant-...) that grants access to Claude models and the Messages API.',
    risk: 'Unauthorized model usage at your expense. Can access any capabilities available to your account tier.',
    action: 'Revoke the key at console.anthropic.com/settings/keys and generate a new one.',
  },

  // ── Source Control ──
  'GitHub Token (classic)': {
    description: 'A GitHub personal access token (classic) that grants API access to repositories and account actions.',
    risk: 'Can read/write repos, manage issues, and access private data depending on granted scopes.',
    action: 'Revoke the token at github.com/settings/tokens and generate a new one with minimal scopes.',
  },
  'GitHub Token (fine-grained)': {
    description: 'A GitHub fine-grained personal access token with specific repository and permission scoping.',
    risk: 'Access depends on configured permissions — can range from read-only to full admin on specific repos.',
    action: 'Revoke at github.com/settings/tokens and regenerate with the minimum required permissions.',
  },
  'GitLab Token': {
    description: 'A GitLab personal access token (glpat-...) for API and Git operations.',
    risk: 'Can access repositories, CI/CD pipelines, and project settings depending on token scopes.',
    action: 'Revoke at gitlab.com/-/user_settings/personal_access_tokens and generate a new token.',
  },
  'Bitbucket App Password': {
    description: 'A Bitbucket app password used for API authentication and Git operations over HTTPS.',
    risk: 'Can clone repos, push code, and access Bitbucket APIs with the permissions of the associated account.',
    action: 'Revoke the app password in Bitbucket settings and create a new one with limited scopes.',
  },

  // ── Messaging / Collaboration ──
  'Slack Token': {
    description: 'A Slack API token (bot, user, or app) that grants access to workspace messaging and data.',
    risk: 'Can read messages, post as users, access files, and exfiltrate workspace data.',
    action: 'Revoke the token in Slack workspace settings and rotate the app credentials.',
  },
  'Slack Webhook': {
    description: 'A Slack incoming webhook URL that allows posting messages to a specific channel.',
    risk: 'Attackers can send phishing or spam messages to your Slack channel.',
    action: 'Delete the webhook in Slack app settings and create a new one if still needed.',
  },
  'Discord Bot Token': {
    description: 'A Discord bot authentication token that grants full control of the bot account.',
    risk: 'Full control of the bot: read/send messages, manage channels, kick/ban members on authorized servers.',
    action: 'Regenerate the token at discord.com/developers/applications and update your bot configuration.',
  },
  'Discord Webhook': {
    description: 'A Discord webhook URL that allows posting messages to a specific channel.',
    risk: 'Attackers can post spam, phishing, or malicious content to your Discord channel.',
    action: 'Delete the webhook in Discord channel settings and create a new one.',
  },
  'Telegram Bot Token': {
    description: 'A Telegram Bot API token issued by BotFather for controlling a Telegram bot.',
    risk: 'Full control of the bot: send/read messages, manage groups, and access user data.',
    action: 'Revoke the token via BotFather (/revoke command) and generate a new one.',
  },

  // ── Payments ──
  'Stripe Secret Key': {
    description: 'A Stripe live-mode secret key (sk_live_) that authenticates server-side API requests.',
    risk: 'Full access to Stripe account: create charges, issue refunds, access customer payment data.',
    action: 'Roll the key immediately at dashboard.stripe.com/apikeys. Review recent transactions for fraud.',
  },
  'Stripe Publishable Key': {
    description: 'A Stripe live-mode publishable key (pk_live_) used client-side for tokenizing payment info.',
    risk: 'Low direct risk (designed for client use), but confirms a live Stripe integration and can be used for recon.',
    action: 'Roll the key at dashboard.stripe.com/apikeys if paired with an exposed secret key.',
  },
  'Stripe Restricted Key': {
    description: 'A Stripe restricted key (rk_live_) with limited permissions for specific API operations.',
    risk: 'Access limited to configured permissions, but can still perform authorized financial operations.',
    action: 'Delete and recreate the restricted key with minimum required permissions.',
  },
  'Square Access Token': {
    description: 'A Square access token (sq0atp-) for authenticating API calls to Square payment services.',
    risk: 'Can process payments, access transaction history, manage inventory, and view customer data.',
    action: 'Revoke the token in the Square Developer Dashboard and rotate credentials.',
  },
  'Square OAuth Secret': {
    description: 'A Square OAuth client secret (sq0csp-) used for server-side OAuth flows.',
    risk: 'Can be used to generate access tokens and impersonate your application with Square.',
    action: 'Regenerate the OAuth secret in Square Developer Dashboard and update your application.',
  },
  'PayPal Client Secret': {
    description: 'A PayPal REST API client secret used with a client ID for OAuth authentication.',
    risk: 'Can process payments, issue refunds, and access transaction data through the PayPal API.',
    action: 'Regenerate the secret in the PayPal Developer Dashboard and update your integration.',
  },

  // ── E-Commerce ──
  'Shopify Access Token': {
    description: 'A Shopify Admin API access token (shpat_) for programmatic store management.',
    risk: 'Can read/write products, orders, customers, and other store data depending on scopes.',
    action: 'Uninstall and reinstall the app to rotate tokens, or regenerate in the Shopify Partners dashboard.',
  },
  'Shopify Shared Secret': {
    description: 'A Shopify app shared secret (shpss_) used for verifying webhook signatures and OAuth.',
    risk: 'Can forge webhook payloads and bypass signature verification for your Shopify app.',
    action: 'Regenerate the shared secret in the Shopify Partners dashboard.',
  },
  'Shopify Custom App Token': {
    description: 'A Shopify custom app access token (shpca_) for store-specific integrations.',
    risk: 'Direct access to the store\'s Admin API with the permissions granted to the custom app.',
    action: 'Regenerate the token in Shopify admin under Apps > Custom apps.',
  },
  'Shopify Private App Token': {
    description: 'A Shopify private app access token (shppa_) for legacy store integrations.',
    risk: 'Full API access to the store with the permissions configured for the private app.',
    action: 'Delete the private app and create a new one, or migrate to a custom app.',
  },

  // ── Email / Communication ──
  'SendGrid API Key': {
    description: 'A SendGrid API key (SG.) for sending transactional and marketing emails.',
    risk: 'Can send emails from your domain, potentially for phishing. Can access contact lists and templates.',
    action: 'Delete the key at app.sendgrid.com/settings/api_keys and create a new one with restricted scopes.',
  },
  'Mailgun API Key': {
    description: 'A Mailgun API key (key-) for sending and tracking emails via the Mailgun service.',
    risk: 'Can send emails from your verified domains and access email logs, routes, and mailing lists.',
    action: 'Rotate the key in the Mailgun dashboard under Security > API Security.',
  },
  'Mailchimp API Key': {
    description: 'A Mailchimp API key for managing audiences, campaigns, and email automations.',
    risk: 'Can access subscriber lists, send campaigns, and export audience data.',
    action: 'Delete the key in Mailchimp Account > Extras > API keys and generate a new one.',
  },
  'Twilio API Key': {
    description: 'A Twilio API key (SK...) for authenticating Twilio REST API requests.',
    risk: 'Can send SMS/calls, access call logs, and manage phone numbers, potentially incurring charges.',
    action: 'Delete the API key in the Twilio Console and create a new one.',
  },
  'Twilio Account SID': {
    description: 'A Twilio Account SID (AC...) — the account identifier used alongside auth tokens.',
    risk: 'Not a secret by itself, but combined with an auth token grants full account access.',
    action: 'If paired with an exposed auth token, rotate the auth token in the Twilio Console.',
  },

  // ── Infrastructure / DevOps ──
  'Heroku API Key': {
    description: 'A Heroku API key (UUID format) for managing Heroku apps, add-ons, and deployments.',
    risk: 'Can deploy code, access environment variables containing secrets, and manage billing.',
    action: 'Regenerate the API key at dashboard.heroku.com/account and update CLI/CI configurations.',
  },
  'Datadog API Key': {
    description: 'A Datadog API or application key for submitting metrics, logs, and managing monitors.',
    risk: 'Can submit fake metrics, read dashboards, and access sensitive operational data.',
    action: 'Revoke the key in Datadog Organization Settings > API Keys and create a new one.',
  },
  'npm Token': {
    description: 'An npm access token (npm_) for publishing packages and accessing private registries.',
    risk: 'Can publish malicious versions of your packages (supply chain attack) or access private packages.',
    action: 'Revoke at npmjs.com/settings/tokens and generate a new token with minimal permissions.',
  },
  'PyPI Token': {
    description: 'A PyPI API token (pypi-) for publishing Python packages to the Python Package Index.',
    risk: 'Can publish malicious package versions, enabling supply chain attacks on downstream users.',
    action: 'Delete the token at pypi.org/manage/account/token and create a new project-scoped token.',
  },
  'NuGet API Key': {
    description: 'A NuGet API key for publishing .NET packages to nuget.org.',
    risk: 'Can publish malicious package updates to nuget.org, affecting downstream .NET projects.',
    action: 'Regenerate the key at nuget.org/account/apikeys.',
  },
  'Docker Hub Token': {
    description: 'A Docker Hub personal access token (dckr_pat_) for pushing/pulling container images.',
    risk: 'Can push malicious images to your repositories or access private container images.',
    action: 'Revoke the token at hub.docker.com/settings/security and generate a new one.',
  },

  // ── Databases ──
  'Database Connection String': {
    description: 'A database connection URI (MongoDB, PostgreSQL, MySQL, Redis, or AMQP) with embedded credentials.',
    risk: 'Direct database access: read, modify, or delete data. May contain admin credentials.',
    action: 'Rotate the database password immediately, restrict network access, and move the URI to a secrets manager.',
  },

  // ── Crypto / Keys ──
  'Private Key': {
    description: 'A PEM-encoded private key (RSA, EC, DSA, OpenSSH, or PGP) used for encryption or authentication.',
    risk: 'Compromises TLS/SSH authentication. Can impersonate servers, sign code, or decrypt traffic.',
    action: 'Revoke associated certificates, regenerate the key pair, and update all systems using it.',
  },

  // ── Generic ──
  'Generic Secret Assignment': {
    description: 'A hardcoded password, secret, or token value assigned directly in source code.',
    risk: 'Exposes credentials that may grant access to databases, APIs, or internal services.',
    action: 'Move the secret to an environment variable or secrets manager and rotate the credential.',
  },
  'Generic Bearer Token': {
    description: 'An Authorization header with a Bearer token, typically used for API authentication.',
    risk: 'A valid bearer token grants authenticated access to the API it was issued for.',
    action: 'Invalidate the token server-side and ensure tokens are not hardcoded in source.',
  },
  'JWT': {
    description: 'A JSON Web Token containing encoded claims, typically used for authentication sessions.',
    risk: 'May contain valid session tokens that grant authenticated access to APIs or user accounts.',
    action: 'Invalidate the token server-side, rotate the signing key if it was exposed, and review session management.',
  },
}
