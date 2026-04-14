import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMProvider = "anthropic" | "openai" | "custom";

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

function getProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();

  // Explicit provider selection
  if (provider === "custom" && process.env.CUSTOM_LLM_URL) return "custom";
  if (provider === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";

  // Auto-detect: custom first (cheapest), then anthropic, then openai
  if (process.env.CUSTOM_LLM_URL && process.env.CUSTOM_LLM_API_KEY) return "custom";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";

  throw new Error("No LLM configured. Set CUSTOM_LLM_URL+CUSTOM_LLM_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.");
}

function getCustomModel(): string {
  return process.env.CUSTOM_LLM_MODEL || "gpt-3.5-turbo";
}

async function* streamCustom(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): AsyncGenerator<string> {
  const client = new OpenAI({
    apiKey: process.env.CUSTOM_LLM_API_KEY || "no-key",
    baseURL: process.env.CUSTOM_LLM_URL,
  });

  const stream = await client.chat.completions.create({
    model: getCustomModel(),
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

async function* streamAnthropic(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

async function* streamOpenAI(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

export async function* streamAnalysis(
  prompt: string,
  context?: string
): AsyncGenerator<string> {
  const provider = getProvider();
  const userMessage = context
    ? `Context:\n${context}\n\nUser request:\n${prompt}`
    : prompt;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: userMessage },
  ];

  if (provider === "custom") {
    yield* streamCustom(CRYPTO_SYSTEM_PROMPT, messages);
  } else if (provider === "anthropic") {
    yield* streamAnthropic(CRYPTO_SYSTEM_PROMPT, messages);
  } else {
    yield* streamOpenAI(CRYPTO_SYSTEM_PROMPT, messages);
  }
}

export async function* streamChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): AsyncGenerator<string> {
  const provider = getProvider();

  if (provider === "custom") {
    yield* streamCustom(CRYPTO_SYSTEM_PROMPT, messages);
  } else if (provider === "anthropic") {
    yield* streamAnthropic(CRYPTO_SYSTEM_PROMPT, messages);
  } else {
    yield* streamOpenAI(CRYPTO_SYSTEM_PROMPT, messages);
  }
}
