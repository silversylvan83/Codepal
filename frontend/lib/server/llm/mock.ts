export async function reviewWithMock({ code, language }: { code: string; language?: string }) {
  return [
    `Mock review for ${language || 'code'}:`,
    '- Add validation and error handling',
    '- Extract helpers for readability',
    '- Consider performance tweaks',
    '',
    'Preview:',
    code.slice(0, 120) + (code.length > 120 ? '...' : ''),
  ].join('\n');
}
