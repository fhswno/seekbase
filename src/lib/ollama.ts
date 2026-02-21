const DEFAULT_BASE_URL = "http://localhost:11434";

export interface OllamaGenerateParams {
  model: string;
  prompt: string;
  system?: string;
  baseUrl?: string;
}

export interface OllamaStreamChunk {
  response: string;
  done: boolean;
}

export async function checkOllamaStatus(
  baseUrl: string = DEFAULT_BASE_URL,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getModels(
  baseUrl: string = DEFAULT_BASE_URL,
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data: { models: Array<{ name: string }> } = await response.json();
    return data.models.map((m) => m.name);
  } catch {
    return [];
  }
}

/** Streaming text generation. Yields text chunks. Can be aborted via AbortSignal. */
export async function* generate(
  params: OllamaGenerateParams & { signal?: AbortSignal },
): AsyncGenerator<OllamaStreamChunk> {
  const baseUrl = params.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model,
      prompt: params.prompt,
      system: params.system,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Ollama error: ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim()) {
          const chunk: OllamaStreamChunk = JSON.parse(line);
          yield chunk;
          if (chunk.done) return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Non-streaming generation for quick completions (e.g., autocomplete). */
export async function generateComplete(
  params: OllamaGenerateParams & { signal?: AbortSignal },
): Promise<string> {
  const baseUrl = params.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model,
      prompt: params.prompt,
      system: params.system,
      stream: false,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data: { response: string } = await response.json();
  return data.response;
}

/** Collect streamed text into a single string, calling onChunk for each piece. */
export async function generateWithCallback(
  params: OllamaGenerateParams & { signal?: AbortSignal },
  onChunk: (text: string, fullText: string) => void,
): Promise<string> {
  let fullText = "";
  for await (const chunk of generate(params)) {
    fullText += chunk.response;
    onChunk(chunk.response, fullText);
    if (chunk.done) break;
  }
  return fullText;
}
