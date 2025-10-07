// A playful mock that pretends to review code and returns a tiny diff.
export async function reviewWithMock(input: {
  code: string; language?: string;
}) {
  const lines = input.code.split('\n');
  const comments = [];
  if (!/use strict/.test(input.code) && (input.language || '').includes('js')) {
    comments.push({ line: 1, level: 'info', message: 'Consider adding "use strict"; at the top.' });
  }
  // simple patch: add newline at end if missing
  const hasFinalNewline = input.code.endsWith('\n');
  const patch = hasFinalNewline
    ? ''
    : '@@ -1,1 +1,2 @@\n-' + lines.join('\n') + '\n+' + lines.join('\n') + '\n';

  return {
    summary: 'Basic hygiene suggestions and formatting fixes.',
    comments,
    patch
  };
}
