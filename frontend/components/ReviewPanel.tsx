export default function ReviewPanel({
  summary, comments
}: { summary?: string; comments?: { line:number; level:string; message:string }[] }) {
  return (
    <aside className="space-y-3">
      <section className="rounded-xl border p-3 bg-white">
        <h3 className="font-semibold mb-1">Summary</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{summary || '—'}</p>
      </section>
      <section className="rounded-xl border p-3 bg-white">
        <h3 className="font-semibold mb-2">Comments</h3>
        <ul className="space-y-2">
          {(comments && comments.length ? comments : [{ line: 1, level: 'info', message: 'No issues found.' }]).map((c,i)=>(
            <li key={i} className="text-sm">
              <span className={`mr-2 inline-block rounded px-1.5 py-[2px] text-xs ${c.level==='error'?'bg-rose-100 text-rose-700':c.level==='warn'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-700'}`}>
                L{c.line}
              </span>
              {c.message}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
