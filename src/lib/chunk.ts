export interface ChunkOptions {
  targetSize?: number;
  overlap?: number;
}

export interface TextChunk {
  content: string;
}

const DEFAULT_TARGET = 800;
const DEFAULT_OVERLAP = 120;

function splitUnits(text: string): string[] {
  const byParagraph = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (byParagraph.length > 1) return byParagraph;

  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function overlapSuffix(text: string, overlap: number): string {
  if (text.length <= overlap) return text;
  const tail = text.slice(-overlap);
  const space = tail.indexOf(" ");
  return space >= 0 ? tail.slice(space + 1) : tail;
}

function hardSplit(text: string, targetSize: number, overlap: number): string[] {
  const parts: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + targetSize, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf(" ")
      );
      if (breakAt > targetSize * 0.4) {
        end = start + breakAt + 1;
      }
    }
    const piece = text.slice(start, end).trim();
    if (piece) parts.push(piece);
    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return parts;
}

export function chunkText(text: string, opts?: ChunkOptions): TextChunk[] {
  const targetSize = opts?.targetSize ?? DEFAULT_TARGET;
  const overlap = opts?.overlap ?? DEFAULT_OVERLAP;
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const units = splitUnits(normalized);
  const chunks: string[] = [];
  let buffer = "";

  for (const unit of units) {
    if (unit.length > targetSize) {
      if (buffer.trim()) {
        chunks.push(buffer.trim());
        buffer = "";
      }
      chunks.push(...hardSplit(unit, targetSize, overlap));
      continue;
    }

    const joined = buffer ? `${buffer}\n\n${unit}` : unit;
    if (joined.length <= targetSize) {
      buffer = joined;
      continue;
    }

    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = `${overlapSuffix(buffer, overlap)}\n\n${unit}`.trim();
    if (buffer.length > targetSize) {
      chunks.push(...hardSplit(buffer, targetSize, overlap));
      buffer = "";
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());

  const unique = chunks.filter((c) => c.length > 0);
  return unique.map((content) => ({ content }));
}
