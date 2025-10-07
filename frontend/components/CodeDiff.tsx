'use client'
import dynamic from 'next/dynamic';
const DiffEditor = dynamic(() => import('@monaco-editor/react').then(m => m.DiffEditor), { ssr: false });

export default function CodeDiff({ original, modified, language = 'javascript' }: { original: string; modified: string; language?: string }) {
  return (
    <div className="h-[55vh] border rounded-xl overflow-hidden bg-white">
      <DiffEditor original={original} modified={modified} language={language} options={{
        renderSideBySide: true, readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontLigatures: true, automaticLayout: true
      }} />
    </div>
  );
}
