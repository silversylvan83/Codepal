export function parseGeminiReview(markdown: string) {
  const text = markdown || "";
  const lines = text.split(/\r?\n/);
  const stopIdx = lines.findIndex((l) => /^###\s|^---\s*$/.test(l));
  const head = lines
    .slice(0, stopIdx === -1 ? lines.length : stopIdx)
    .join("\n")
    .trim();
  const summary = head.replace(/^\s*```[\s\S]*?```\s*$/g, "").trim();

  const comments: Array<{ line: number; level: string; message: string }> = [];
  const levelMap: Record<string, string> = {
    bugs: "bug",
    fixes: "bug",
    performance: "performance",
    memory: "performance",
    readability: "readability",
    "best-practice": "readability",
    security: "security",
  };

  function collect(section: string, hint: string) {
    const i0 = lines.findIndex((l) =>
      new RegExp(`^####\\s*\\d?\\.?\\s*${section}\\b`, "i").test(l)
    );
    if (i0 === -1) return;
    for (
      let i = i0 + 1;
      i < lines.length && !/^###\s|^####\s/.test(lines[i]);
      i++
    ) {
      const m = lines[i].match(/^\s*[-*]\s+(.*)$/);
      if (m) {
        const msg = m[1].trim();
        const lower = msg.toLowerCase();
        let level = hint;
        for (const k of Object.keys(levelMap))
          if (lower.includes(k)) {
            level = levelMap[k];
            break;
          }
        comments.push({ line: 0, level, message: msg });
      }
    }
  }

  collect("Bugs and Fixes", "bug");
  collect("Performance", "performance");
  collect("Readability", "readability");
  collect("Best-Practice", "readability");
  collect("Security", "security");
  collect("Security Issues", "security");

  // improved snippet
  let improvedSnippet: string | undefined;
  const impIdx = lines.findIndex((l) => /^###\s*Improved Snippet/i.test(l));
  if (impIdx !== -1) {
    const after = lines.slice(impIdx + 1).join("\n");
    const codeMatch = after.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)\s*```/);
    if (codeMatch) improvedSnippet = codeMatch[1];
  }

  return { summary, comments, improvedSnippet };
}
