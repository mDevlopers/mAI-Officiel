import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { SessionGuard } from "@/components/security/session-guard";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BRAND_LOGO_COOKIE_NAME, DEFAULT_BRAND_LOGO } from "@/hooks/use-brand-logo";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const logoUrl = cookieStore.get(BRAND_LOGO_COOKIE_NAME)?.value || DEFAULT_BRAND_LOGO;

  return {
    metadataBase: new URL("https://mai-officiel.vercel.app"),
    title: "mAI",
    description: "Avec mAI, passez à la vitesse supérieure !",
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    },
  };
}

export const viewport = {
  maximumScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-app",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(220 30% 98%)";
const DARK_THEME_COLOR = "hsl(243 28% 7%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  const html = document.documentElement;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    const isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  const observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${geistMono.variable}`}
      lang="fr"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>
              <RegisterServiceWorker />
              <SessionGuard />
              {children}
            </TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
