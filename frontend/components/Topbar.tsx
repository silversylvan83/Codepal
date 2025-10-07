'use client'
export default function Topbar() {
  return (
    <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="font-semibold">CodePal</div>
        <div className="text-xs text-slate-500">AI Code Reviewer (MVP)</div>
      </div>
    </div>
  );
}
