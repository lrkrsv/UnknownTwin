import path from "path";
import {
  env,
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
} from "@huggingface/transformers";
import {
  LLM_ENGINE,
  OLLAMA_MODEL,
  OLLAMA_URL,
  TRANSFORMERS_LLM_DTYPE,
  TRANSFORMERS_LLM_MODEL,
} from "@/lib/constants";

env.cacheDir = path.join(process.cwd(), "data", "model-cache");
env.allowLocalModels = true;
env.allowRemoteModels = true;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  maxNewTokens?: number;
}

let generatorPromise: Promise<TextGenerationPipeline> | null = null;

function getTransformersGenerator(): Promise<TextGenerationPipeline> {
  if (!generatorPromise) {
    const options = TRANSFORMERS_LLM_MODEL.includes("ONNX")
      ? { dtype: TRANSFORMERS_LLM_DTYPE as "q4" }
      : undefined;
    generatorPromise = pipeline(
      "text-generation",
      TRANSFORMERS_LLM_MODEL,
      options
    ) as Promise<TextGenerationPipeline>;
  }
  return generatorPromise;
}

async function* transformersGenerateStream(
  messages: ChatMessage[],
  opts?: GenerateOptions
): AsyncGenerator<string> {
  const generator = await getTransformersGenerator();
  const queue: string[] = [];
  let notify: (() => void) | null = null;
  let streamDone = false;

  const waitForChunk = () =>
    new Promise<void>((resolve) => {
      notify = resolve;
    });

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text: string) => {
      queue.push(text);
      notify?.();
      notify = null;
    },
  });

  const generation = generator(messages, {
    max_new_tokens: opts?.maxNewTokens ?? 512,
    do_sample: false,
    return_full_text: false,
    streamer,
  }).finally(() => {
    streamDone = true;
    notify?.();
  });

  while (!streamDone || queue.length > 0) {
    if (queue.length === 0) {
      await waitForChunk();
      continue;
    }
    yield queue.shift()!;
  }

  await generation;
}

async function* ollamaGenerateStream(
  messages: ChatMessage[],
  opts?: GenerateOptions
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: { num_predict: opts?.maxNewTokens ?? 512 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${body}`);
  }

  if (!response.body) {
    throw new Error("Ollama response has no body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const json = JSON.parse(trimmed) as {
        message?: { content?: string };
      };
      const delta = json.message?.content;
      if (delta) yield delta;
    }
  }
}

export async function* generateStream(
  messages: ChatMessage[],
  opts?: GenerateOptions
): AsyncGenerator<string> {
  if (LLM_ENGINE === "ollama") {
    yield* ollamaGenerateStream(messages, opts);
  } else {
    yield* transformersGenerateStream(messages, opts);
  }
}

export async function generate(
  messages: ChatMessage[],
  opts?: GenerateOptions
): Promise<string> {
  let text = "";
  for await (const delta of generateStream(messages, opts)) {
    text += delta;
  }
  return text;
}
