export async function reviewWithMock({ code, language }) {
  return [
    `Mock review for ${language || "code"}:`,
    "- Add error handling and input validation.",
    "- Consider extracting helpers for readability.",
    "- Write unit tests for edge cases.",
    "",
    "Preview:",
    code.slice(0, 120) + (code.length > 120 ? "..." : "")
  ].join("\n");
}
