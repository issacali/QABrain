import Setting from "../models/Setting.js";
import { decrypt } from "../utils/crypto.js";
import OpenAIProvider from "../providers/OpenAIProvider.js";
import GeminiProvider from "../providers/GeminiProvider.js";
import OllamaProvider from "../providers/OllamaProvider.js";
import MockProvider from "../providers/MockProvider.js";

async function getSettings() {
  try {
    // Use a short timeout to avoid hanging in mock mode
    const settings = await Promise.race([
      Setting.findOne(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
    ]);
    return settings || {};
  } catch (err) {
    // In mock mode, DB queries may timeout - just use defaults
    console.warn("⚠ Settings lookup timeout (using defaults)");
    return {};
  }
}

export async function getProvider(model) {
  const s = await getSettings();
  const selected = model || s?.ai?.activeModel || "chatgpt";
  
  if (selected === "chatgpt") {
    const apiKey = decrypt(s?.ai?.openai?.apiKey) || process.env.OPENAI_API_KEY;
    if (!apiKey) return new MockProvider();
    return new OpenAIProvider({
      apiKey,
      model: s?.ai?.openai?.model || process.env.OPENAI_MODEL || "gpt-4o-mini"
    });
  }
  
  if (selected === "gemini") {
    const apiKey = decrypt(s?.ai?.gemini?.apiKey) || process.env.GEMINI_API_KEY;
    if (!apiKey) return new MockProvider();
    return new GeminiProvider({
      apiKey,
      model: s?.ai?.gemini?.model || process.env.GEMINI_MODEL || "gemini-1.5-flash"
    });
  }
  
  // Ollama - try to connect, fallback to mock if unavailable
  return new OllamaProvider({
    endpoint: s?.ai?.ollama?.endpoint || process.env.OLLAMA_ENDPOINT || "http://localhost:11434",
    model: s?.ai?.ollama?.model || process.env.OLLAMA_MODEL || "llama3.1"
  });
}
