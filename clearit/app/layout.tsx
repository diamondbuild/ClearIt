import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LetsConfirmIt — What is this?",
  description:
    "Point at anything confusing. LetsConfirmIt tells you what it is, what it means, and what to do.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "LetsConfirmIt" },
  openGraph: {
    title: "LetsConfirmIt — What is this?",
    description: "Point at anything confusing and get a plain-English answer.",
    type: "website",
    siteName: "LetsConfirmIt",
  },
  twitter: {
    card: "summary",
    title: "LetsConfirmIt",
    description: "Point at anything confusing and get a plain-English answer.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F4" },
    { media: "(prefers-color-scheme: dark)",  color: "#141019" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Apply saved text size + theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = localStorage.getItem('clearit_text_size');
            var sizes = { small: '14px', regular: '16px', large: '18px' };
            if (s && sizes[s]) document.documentElement.style.fontSize = sizes[s];
            var t = localStorage.getItem('clearit_theme');
            var dark = t === 'dark' || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (dark) document.documentElement.classList.add('dark');
          } catch(e) {}
        `}} />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
