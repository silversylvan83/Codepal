import Link from 'next/link';
import { GitBranch } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="relative border-t border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-b from-white/90 via-slate-50/90 to-slate-100/90 dark:from-slate-950/70 dark:via-slate-950/70 dark:to-slate-900/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      {/* subtle top glow */}
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6 items-center text-slate-700 dark:text-slate-300">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-md shadow-blue-600/20">
            <GitBranch size={16} className="text-white" />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            CodeLens • Build better, faster.
          </span>
        </div>

        {/* Center text */}
        <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
          © {new Date().getFullYear()} <span className="font-medium text-slate-700 dark:text-slate-200">CodeLens</span>. All rights reserved.
        </div>

        {/* Right navigation */}
        <div className="flex justify-end gap-3 text-sm">
          <Link
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            href="/review"
          >
            Review
          </Link>
          <Link
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            href="/history"
          >
            History
          </Link>
          <a
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
