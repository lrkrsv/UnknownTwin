/**
 * Strip chain-of-thought / thinking blocks from streamed LLM output.
 * Handles ... and <think>...</think>.
 */
export function createThinkingStripper() {
  let buffer = "";
  let skipping = false;

  const openTags = ["", "<think>"];
  const closeTags = ["", "</think>"];

  return function strip(delta: string): string {
    buffer += delta;
    let output = "";

    while (buffer.length > 0) {
      if (skipping) {
        let closeIdx = -1;
        let closeLen = 0;
        for (const tag of closeTags) {
          const idx = buffer.toLowerCase().indexOf(tag);
          if (idx !== -1 && (closeIdx === -1 || idx < closeIdx)) {
            closeIdx = idx;
            closeLen = tag.length;
          }
        }
        if (closeIdx === -1) {
          buffer = buffer.slice(-30);
          break;
        }
        buffer = buffer.slice(closeIdx + closeLen);
        skipping = false;
        continue;
      }

      const lower = buffer.toLowerCase();
      let openIdx = -1;
      let openLen = 0;
      for (const tag of openTags) {
        const idx = lower.indexOf(tag);
        if (idx !== -1 && (openIdx === -1 || idx < openIdx)) {
          openIdx = idx;
          openLen = tag.length;
        }
      }

      if (openIdx === -1) {
        const partial = buffer.slice(-25);
        const safeLen = buffer.length - partial.length;
        output += buffer.slice(0, safeLen);
        buffer = partial;
        break;
      }

      output += buffer.slice(0, openIdx);
      buffer = buffer.slice(openIdx + openLen);
      skipping = true;
    }

    return output;
  };
}

export function stripThinkingBlocks(text: string): string {
  return text
    .replace(/[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, "")
    .trim();
}
