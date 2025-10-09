"use client";

import Link from "next/link";
import {
  Code2,
  Sparkles,
  Wand2,
  ShieldCheck,
  Gauge,
  GitBranch,
  ArrowRight,
  History,
  Stars,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  // tiny code “preview” swapper for the hero
  const snippets = [
    `// JavaScript
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') return 0;
  return a + b;
}`,
    `// TypeScript
export function clamp(v: number, min: number, max: number) {
  if (min > max) [min, max] = [max, min];
  return Math.min(Math.max(v, min), max);
}`,
    `# Python
def parse_int(x):
    try:
        return int(x)
    except (TypeError, ValueError):
        return None`,
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % snippets.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/60 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.4)] transition-all">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 group">
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
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
            {[
              { href: "/review", label: "Review" },
              { href: "/history", label: "History" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r from-blue-600 to-indigo-600 after:transition-all hover:after:w-full hover:text-blue-600 dark:hover:text-blue-400"
              >
                {label}
              </Link>
            ))}

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r from-blue-600 to-indigo-600 after:transition-all hover:after:w-full hover:text-blue-600 dark:hover:text-blue-400"
            >
              GitHub
            </a>
          </nav>

          {/* CTA Button */}
          <Link
            href="/review"
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-300 overflow-hidden group"
          >
            <Sparkles
              size={16}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="font-medium">Start Reviewing</span>

            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/15" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-900/50 bg-white/70 dark:bg-slate-900/60 px-3 py-1 text-xs text-blue-700 dark:text-blue-300">
              <Stars className="h-3.5 w-3.5" />
              AI-powered code reviews
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Ship cleaner code,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}
                faster
              </span>
              .
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              CodeLens reviews your snippets for correctness, security, and
              style — then hands you an optimized version on the spot.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/review"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition shadow-sm"
              >
                <Sparkles size={18} />
                Start Reviewing Code
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 px-5 py-3 rounded-xl transition"
              >
                <History size={18} />
                View History
              </Link>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Works with JavaScript, TypeScript, Python, Go, Java, C# and more.
            </div>
          </div>

          {/* Code card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl" />
            <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-4 shadow-xl">
              {/* window controls */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="text-xs text-slate-500">preview.ts</div>
              </div>

              <pre className="mt-3 max-h-[320px] overflow-hidden rounded-xl bg-slate-950 text-slate-100 p-4 text-xs leading-6 shadow-inner">
                {snippets[idx]}
              </pre>

              <div className="mt-3 flex items-center justify-end">
                <Link
                  href="/review"
                  className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Improve this snippet <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            icon={<Wand2 className="h-5 w-5" />}
            title="Actionable Reviews"
            desc="Clear, prioritized feedback on bugs, readability, and performance."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Safety Checks"
            desc="Surface risky patterns early — input validation, edge cases, and more."
          />
          <Feature
            icon={<Gauge className="h-5 w-5" />}
            title="Instant Optimizations"
            desc="Get a ready-to-paste improved snippet alongside the review."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <Step
              n={1}
              title="Paste code"
              desc="Drop in a function, module, or handler in your language of choice."
            />
            <Step
              n={2}
              title="Review & analyze"
              desc="AI spots bugs, edge cases, and performance traps."
            />
            <Step
              n={3}
              title="Apply improvements"
              desc="Copy the optimized snippet or compare changes before merging."
            />
          </ol>
          <div className="mt-6">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl hover:opacity-90 transition"
            >
              Try it now <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Logos / social proof (lightweight) */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h3 className="text-center text-sm uppercase tracking-widest text-slate-500">
          Loved by builders from
        </h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-70">
          <Logo label="Next.js" />
          <Logo label="Node.js" />
          <Logo label="MongoDB" />
          <Logo label="TypeScript" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          <Testimonial
            quote="Cut my review time in half and caught a nasty edge case."
            name="Priya S."
            role="Senior Frontend Engineer"
          />
          <Testimonial
            quote="The improved snippet is the killer feature. Copy, adapt, ship."
            name="Rahul M."
            role="Full-stack Dev"
          />
          <Testimonial
            quote="Clear feedback, no fluff. It’s like a staff engineer on standby."
            name="Anika T."
            role="Tech Lead"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center">
              <GitBranch size={16} className="text-white" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              CodeLens • Build better, faster.
            </span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
            © {new Date().getFullYear()} CodeLens. All rights reserved.
          </div>
          <div className="flex justify-end gap-3 text-sm">
            <Link
              className="hover:underline text-slate-600 dark:text-slate-300"
              href="/review"
            >
              Review
            </Link>
            <Link
              className="hover:underline text-slate-600 dark:text-slate-300"
              href="/history"
            >
              History
            </Link>
            <a
              className="hover:underline text-slate-600 dark:text-slate-300"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-5">
      <div className="h-9 w-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 grid place-items-center">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-5">
      <div className="h-6 w-6 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs grid place-items-center">
        {n}
      </div>
      <div className="mt-2 font-medium">{title}</div>
      <div className="text-slate-600 dark:text-slate-400">{desc}</div>
    </li>
  );
}

function Logo({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur h-16 grid place-items-center text-sm font-medium">
      {label}
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-5">
      <p className="text-slate-800 dark:text-slate-200 italic">“{quote}”</p>
      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {name} • {role}
      </div>
    </div>
  );
}
