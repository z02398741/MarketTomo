import type { LLMProvider } from "./provider"
import { geminiProvider } from "./gemini"

// Registry of available LLM providers. Add new ones here, then select via the
// AI_PROVIDER env var. Gemini is the default.
const providers: Record<string, LLMProvider> = {
  gemini: geminiProvider,
}

export function getProvider(): LLMProvider {
  const name = process.env.AI_PROVIDER ?? "gemini"
  return providers[name] ?? geminiProvider
}
