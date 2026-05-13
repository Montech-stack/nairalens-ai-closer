import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-mesh px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="font-serif text-7xl text-gold gold-text-glow">404</h1>
        <p className="mt-4 text-muted-foreground">This page is off the market.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-noir hover:opacity-90">
          Back to NairaLens
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="font-serif text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-noir"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NairaLens — AI Real Estate Sales Engine for Nigeria" },
      { name: "description", content: "NairaLens is the autonomous AI sales engine that qualifies leads, handles objections, and closes Nigerian real estate deals on WhatsApp 24/7." },
      { property: "og:title", content: "NairaLens — AI Real Estate Sales Engine for Nigeria" },
      { property: "og:description", content: "NairaLens is the autonomous AI sales engine that qualifies leads, handles objections, and closes Nigerian real estate deals on WhatsApp 24/7." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "NairaLens — AI Real Estate Sales Engine for Nigeria" },
      { name: "twitter:description", content: "NairaLens is the autonomous AI sales engine that qualifies leads, handles objections, and closes Nigerian real estate deals on WhatsApp 24/7." },
      { property: "og:image", content: "https://naira-lens-pro.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://naira-lens-pro.lovable.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
        <PwaInstallPrompt />
      </AuthProvider>
    </QueryClientProvider>
  );
}
