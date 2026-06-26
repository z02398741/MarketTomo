import type { LLMProvider } from "./provider"

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
const DEFAULT_MODEL = "gemini-2.5-flash"

export class GeminiError extends Error {}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

/**
 * Google Gemini implementation of {@link LLMProvider}. Reads `GEMINI_API_KEY`
 * (required) and optional `GEMINI_MODEL`. Returns the raw text of the first
 * candidate; callers parse it as needed.
 */
export const geminiProvider: LLMProvider = {
  name: "gemini",
  async generate(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new GeminiError("GEMINI_API_KEY is not configured")
    }
    const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL

    const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      throw new GeminiError(`Gemini responded with ${res.status}`)
    }

    const data = (await res.json()) as GeminiResponse
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      ""

    if (!text.trim()) {
      throw new GeminiError("Empty Gemini response")
    }
    return text
  },
}
