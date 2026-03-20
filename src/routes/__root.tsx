// ── Imports ──────────────────────────────────────────────────────────────────

import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

// ── Query Client (singleton) ────────────────────────────────────────────────

interface MyRouterContext {
  queryClient: QueryClient;
}

let context: { queryClient: QueryClient } | undefined;

export function getContext() {
  if (!context) {
    context = { queryClient: new QueryClient() };
  }
  return context;
}

function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getContext().queryClient}>{children}</QueryClientProvider>;
}

// ── SEO ─────────────────────────────────────────────────────────────────────

const SITE_NAME = "Secret Scanner";
const DEFAULT_DESCRIPTION =
  "Scan GitHub repositories for leaked API keys, tokens, passwords, and other secrets. Detect 40+ credential patterns across cloud providers, payment systems, and more.";

// ── Route ───────────────────────────────────────────────────────────────────

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE_NAME} — Find Leaked Credentials on GitHub` },
      { name: "description", content: DEFAULT_DESCRIPTION },
      {
        name: "keywords",
        content:
          "secret scanner, credential leak, GitHub security, API key scanner, token detection, security audit, AWS keys, Stripe keys, OpenAI keys",
      },
      { name: "author", content: SITE_NAME },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#020810" },

      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: `${SITE_NAME} — Find Leaked Credentials on GitHub` },
      { property: "og:description", content: DEFAULT_DESCRIPTION },

      // Twitter Card
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: `${SITE_NAME} — Find Leaked Credentials on GitHub` },
      { name: "twitter:description", content: DEFAULT_DESCRIPTION },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

// ── Shell ───────────────────────────────────────────────────────────────────

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryProvider>
          {children}
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
              { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
            ]}
          />
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  );
}

// ── 404 ─────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div
      className="page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <h1 style={{ fontSize: 48, fontWeight: 800, color: "var(--color-muted)", marginBottom: 8 }}>
        404
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 20 }}>Page not found</p>
      <Link to="/" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: 14 }}>
        &larr; Back to Scanner
      </Link>
    </div>
  );
}
