import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMProvider = "anthropic" | "openai" | "custom";

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
}

const CRYPTO_SYSTEM_PROMPT = `You are an expert cryptocurrency market analyst. You provide analysis in both Arabic and English based on the user's language.

Guidelines:
- Be factual and data-driven in your analysis
- Always mention risks and volatility
- Never provide financial advice - always include disclaimers
- Explain technical concepts clearly
- Use proper crypto terminology
- When analyzing articles, extract key insights about mentioned cryptocurrencies
- When answering questions, be concise but thorough

IMPORTANT: Always end your response with a disclaimer in the user's language:
Arabic: "⚠️ هذا ليس نصيحة مالية. قم دائماً بإجراء بحثك الخاص قبل اتخاذ أي قرار استثماري."
English: "⚠️ This is not financial advice. Always do your own research before making any investment decisions."`;

// Get all available providers
export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (process.env.CUSTOM_LLM_URL && process.env.CUSTOM_LLM_API_KEY) providers.push("custom");
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  return providers;
}

// Get all available models across providers
export function getAvailableModels(): LLMModel[] {
  const models: LLMModel[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    models.push(
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic" },
    );
  }

  if (process.env.OPENAI_API_KEY) {
    models.push(
      { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
      { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
    );
  }

  if (process.env.CUSTOM_LLM_URL && process.env.CUSTOM_LLM_API_KEY) {
    const customModel = process.env.CUSTOM_LLM_MODEL || "default";
    // Add the configured custom model
    models.push({ id: customModel, name: `Custom: ${customModel}`, provider: "custom" });

    // Parse additional models from CUSTOM_LLM_MODELS env var (comma-separated)
    const extraModels = process.env.CUSTOM_LLM_MODELS;
    if (extraModels) {
      extraModels.split(",").map((m) => m.trim()).filter(Boolean).forEach((m) => {
        if (m !== customModel) {
          models.push({ id: m, name: `Custom: ${m}`, provider: "custom" });
        }
      });
    }
  }

  return models;
}

// Resolve which provider + model to use
function resolveModel(requestedModel?: string): { provider: LLMProvider; model: string } {
  if (requestedModel) {
    const available = getAvailableModels();
    const found = available.find((m) => m.id === requestedModel);
    if (found) return { provider: found.provider, model: found.id };
  }

  // Fallback to default provider
  const envProvider = process.env.LLM_PROVIDER?.toLowerCase();
  if (envProvider === "custom" && process.env.CUSTOM_LLM_URL) return { provider: "custom", model: process.env.CUSTOM_LLM_MODEL || "default" };
  if (envProvider === "openai" && process.env.OPENAI_API_KEY) return { provider: "openai", model: "gpt-4o" };
  if (envProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", model: "claude-sonnet-4-20250514" };

  if (process.env.CUSTOM_LLM_URL && process.env.CUSTOM_LLM_API_KEY) return { provider: "custom", model: process.env.CUSTOM_LLM_MODEL || "default" };
  if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", model: "claude-sonnet-4-20250514" };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", model: "gpt-4o" };

  throw new Error("No LLM configured.");
}

async function* streamCustom(systemPrompt: string, messages: Array<{ role: string; content: string }>, model: string): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey: process.env.CUSTOM_LLM_API_KEY || "no-key", baseURL: process.env.CUSTOM_LLM_URL });
  const stream = await client.chat.completions.create({
    model, max_tokens: 4096, stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages] as OpenAI.ChatCompletionMessageParam[],
  });
  for await (const chunk of stream) { const t = chunk.choices[0]?.delta?.content; if (t) yield t; }
}

async function* streamAnthropic(systemPrompt: string, messages: Array<{ role: "user" | "assistant"; content: string }>, model: string): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = client.messages.stream({ model, max_tokens: 4096, system: systemPrompt, messages });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
  }
}

async function* streamOpenAI(systemPrompt: string, messages: Array<{ role: string; content: string }>, model: string): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model, max_tokens: 4096, stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages] as OpenAI.ChatCompletionMessageParam[],
  });
  for await (const chunk of stream) { const t = chunk.choices[0]?.delta?.content; if (t) yield t; }
}

export async function* streamAnalysis(prompt: string, context?: string, requestedModel?: string): AsyncGenerator<string> {
  const { provider, model } = resolveModel(requestedModel);
  const userMessage = context ? `Context:\n${context}\n\nUser request:\n${prompt}` : prompt;
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [{ role: "user", content: userMessage }];

  if (provider === "custom") yield* streamCustom(CRYPTO_SYSTEM_PROMPT, messages, model);
  else if (provider === "anthropic") yield* streamAnthropic(CRYPTO_SYSTEM_PROMPT, messages, model);
  else yield* streamOpenAI(CRYPTO_SYSTEM_PROMPT, messages, model);
}

export async function* streamChat(messages: Array<{ role: "user" | "assistant"; content: string }>, requestedModel?: string): AsyncGenerator<string> {
  const { provider, model } = resolveModel(requestedModel);

  if (provider === "custom") yield* streamCustom(CRYPTO_SYSTEM_PROMPT, messages, model);
  else if (provider === "anthropic") yield* streamAnthropic(CRYPTO_SYSTEM_PROMPT, messages, model);
  else yield* streamOpenAI(CRYPTO_SYSTEM_PROMPT, messages, model);
}
