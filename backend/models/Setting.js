import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    ai: {
      activeModel: { type: String, default: "chatgpt" },
      openai: {
        apiKey: String,
        model: { type: String, default: "gpt-4o-mini" }
      },
      gemini: {
        apiKey: String,
        model: { type: String, default: "gemini-1.5-flash" }
      },
      ollama: {
        endpoint: { type: String, default: "http://localhost:11434" },
        model: { type: String, default: "llama3.1" }
      }
    },
    jira: {
      baseUrl: String,
      email: String,
      token: String,
      projectKey: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
