import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/Header";
import { SiteFooter } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CodeLens",
  description: "AI-powered code reviews with improved snippets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
        {/* Global header */}
        <SiteHeader />

        {/* Page content */}
        {children}

        {/* Global footer */}
        <SiteFooter />
      </body>
    </html>
  );
}
