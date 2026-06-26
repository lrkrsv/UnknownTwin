/** Simple language hint for the professor prompt. */
export function detectLanguage(text: string): string {
  const sample = text.slice(0, 500);
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(sample)) {
    return "the same language as the student's question (detected: East Asian script)";
  }
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(sample)) {
    return "French";
  }
  if (/[áéíóúñ¿¡]/i.test(sample)) {
    return "Spanish";
  }
  if (/[äöüß]/i.test(sample)) {
    return "German";
  }
  if (/[ąćęłńóśźż]/i.test(sample)) {
    return "Polish";
  }
  return "English";
}
