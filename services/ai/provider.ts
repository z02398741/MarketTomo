// A minimal, provider-agnostic LLM contract. Swap Gemini for any other model
// by implementing this interface and registering it in ./index.ts.
export interface LLMProvider {
  readonly name: string
  generate(prompt: string): Promise<string>
}
