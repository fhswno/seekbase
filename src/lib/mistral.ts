const MISTRAL_API_URL = "https://api.mistral.ai/v1";

export interface MistralGenerateParams {
  model: string;
  prompt: string;
  system?: string;
  apiKey: string;
  signal?: AbortSignal;
}

interface MistralModel {
  id: string;
  object: string;
}

interface MistralModelsResponse {
  data: MistralModel[];
}

interface MistralStreamChoice {
  delta: { content?: string };
  finish_reason: string | null;
}

interface MistralStreamChunk {
  choices: MistralStreamChoice[];
}

interface MistralCompleteChoice {
  message: { content: string };
}

interface MistralCompleteResponse {
  choices: MistralCompleteChoice[];
}

function handleErrorStatus(status: number, body: string): string {
  switch (status) {
    case 401:
      return "Invalid API key. Check your Mistral API key in Settings.";
    case 402:
      return "No credits remaining on your Mistral account.";
    case 429:
      return "Rate limited by Mistral. Please wait a moment and try again.";
    default:
      try {
        const parsed = JSON.parse(body) as { message?: string };
        return parsed.message ?? `Mistral API error (${status})`;
      } catch {
        return `Mistral API error (${status}): ${body}`;
      }
  }
}

/** Verify that an API key is valid by fetching models */
export async function verifyApiKey(
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${MISTRAL_API_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) {
      return { valid: true };
    }
    const body = await response.text().catch(() => "");
    return { valid: false, error: handleErrorStatus(response.status, body) };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Failed to connect to Mistral API",
    };
  }
}

/** Fetch available models */
export async function getModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(`${MISTRAL_API_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return [];
    const data: MistralModelsResponse = await response.json();
    return data.data.map((m) => m.id).sort();
  } catch {
    return [];
  }
}

/** Streaming text generation via async generator */
export async function* generate(
  params: MistralGenerateParams,
): AsyncGenerator<string> {
  const messages: Array<{ role: string; content: string }> = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  messages.push({ role: "user", content: params.prompt });

  const response = await fetch(`${MISTRAL_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(handleErrorStatus(response.status, errorText));
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
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const chunk: MistralStreamChunk = JSON.parse(data);
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Non-streaming generation */
export async function generateComplete(
  params: MistralGenerateParams,
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  messages.push({ role: "user", content: params.prompt });

  const response = await fetch(`${MISTRAL_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: false,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(handleErrorStatus(response.status, errorText));
  }

  const data: MistralCompleteResponse = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

/** Streaming with callback — same API shape as ollama.generateWithCallback */
export async function generateWithCallback(
  params: MistralGenerateParams,
  onChunk: (text: string, fullText: string) => void,
): Promise<string> {
  let fullText = "";
  for await (const chunk of generate(params)) {
    fullText += chunk;
    onChunk(chunk, fullText);
  }
  return fullText;
}
