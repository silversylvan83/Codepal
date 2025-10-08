// src/utils/parseGeminiReview.ts
export type ParsedReview = {
  summary: string;
  comments: Array<{ line: number; level: string; message: string }>;
  improvedSnippet?: string;
};

export function parseGeminiReview(markdown: string): ParsedReview {
  const text = markdown || '';
  const lines = text.split(/\r?\n/);

  // 1) Summary: before first "###" or '---'
  let summary = '';
  {
    const stopIdx = lines.findIndex((l) => /^###\s|^---\s*$/.test(l));
    const head = lines
      .slice(0, stopIdx === -1 ? lines.length : stopIdx)
      .join('\n')
      .trim();
    summary = head.replace(/^\s*`{3}.*?`{3}\s*$/gs, '').trim();
  }

  // 2) Comments from bullets under known sections
  const comments: ParsedReview['comments'] = [];
  const levelMap: Record<string, string> = {
    bugs: 'bug',
    fixes: 'bug',
    performance: 'performance',
    memory: 'performance',
    readability: 'readability',
    'best-practice': 'readability',
    security: 'security',
  };

  function collectBullets(sectionName: string, levelHint: string) {
    const hIdx = lines.findIndex((l) =>
      new RegExp(`^####\\s*\\d?\\.?\\s*${sectionName}\\b`, 'i').test(l)
    );
    if (hIdx === -1) return;

    let i = hIdx + 1;
    while (i < lines.length && !/^###\s|^####\s/.test(lines[i])) {
      const m = lines[i].match(/^\s*[-*]\s+(.*)$/);
      if (m) {
        const message = m[1].trim();
        const lower = message.toLowerCase();
        let level = levelHint;
        for (const k of Object.keys(levelMap)) {
          if (lower.includes(k)) {
            level = levelMap[k];
            break;
          }
        }
        comments.push({ line: 0, level, message });
      }
      i++;
    }
  }

  collectBullets('Bugs and Fixes', 'bug');
  collectBullets('Performance', 'performance');
  collectBullets('Readability', 'readability');
  collectBullets('Best-Practice', 'readability');
  collectBullets('Security', 'security');
  collectBullets('Security Issues', 'security');

  // 3) Improved Snippet: code block under "### Improved Snippet"
  let improvedSnippet: string | undefined;
  {
    const impIdx = lines.findIndex((l) => /^###\s*Improved Snippet/i.test(l));
    if (impIdx !== -1) {
      const after = lines.slice(impIdx + 1).join('\n');
      const codeMatch = after.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)\s*```/);
      if (codeMatch) improvedSnippet = codeMatch[1];
    }
  }

  return { summary, comments, improvedSnippet };
}
