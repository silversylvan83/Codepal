'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, Sparkles } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const hideCta = pathname === '/review' || pathname === '/history';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/60 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.4)] transition-all">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Brand → Home */}
        <Link
          href="/"
          aria-label="Go to homepage"
          className="flex items-center gap-3 group"
        >
          <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-lg shadow-blue-600/30 group-hover:shadow-indigo-600/30 transition-all duration-500">
            <Code2
              size={18}
              className="text-white drop-shadow-sm group-hover:scale-110 transition-transform"
            />
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/20 group-hover:to-indigo-400/20 transition-all duration-500 blur" />
          </div>
          <span className="font-semibold tracking-tight text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CodeLens
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
          {[
            { href: '/review', label: 'Review' },
            { href: '/history', label: 'History' },
          ].map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative pb-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r from-blue-600 to-indigo-600'
                    : 'hover:text-blue-600 dark:hover:text-blue-400 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-gradient-to-r from-blue-600 to-indigo-600 after:transition-all'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="relative pb-1 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r from-blue-600 to-indigo-600 after:transition-all hover:after:w-full hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </a>
        </nav>

        {/* CTA → Hidden on /review or /history */}
        {!hideCta && (
          <Link
            href="/review"
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-300 overflow-hidden group"
          >
            <Sparkles
              size={16}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="font-medium">Start Reviewing</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
          </Link>
        )}
      </div>
    </header>
  );
}
