import Setting from "../models/Setting.js";
import { decrypt } from "../utils/crypto.js";
import OpenAIProvider from "../providers/OpenAIProvider.js";
import GeminiProvider from "../providers/GeminiProvider.js";
import OllamaProvider from "../providers/OllamaProvider.js";

async function getSettings() {
  const settings = await Setting.findOne();
  return settings || {};
}

export async function getProvider(model) {
  const s = await getSettings();
  const selected = model || s?.ai?.activeModel || "chatgpt";
  if (selected === "chatgpt") {
    return new OpenAIProvider({
      apiKey: decrypt(s?.ai?.openai?.apiKey) || process.env.OPENAI_API_KEY,
      model: s?.ai?.openai?.model || process.env.OPENAI_MODEL || "gpt-4o-mini"
    });
  }
  if (selected === "gemini") {
    return new GeminiProvider({
      apiKey: decrypt(s?.ai?.gemini?.apiKey) || process.env.GEMINI_API_KEY,
      model: s?.ai?.gemini?.model || process.env.GEMINI_MODEL || "gemini-1.5-flash"
    });
  }
  return new OllamaProvider({
    endpoint: s?.ai?.ollama?.endpoint || process.env.OLLAMA_ENDPOINT || "http://localhost:11434",
    model: s?.ai?.ollama?.model || process.env.OLLAMA_MODEL || "llama3.1"
  });
}
